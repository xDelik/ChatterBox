require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const { connectDB } = require('./Config/db');
const { User } = require('./Models');
const { createMessageWithAuthor, fetchMessagesByChannel } = require('./Controllers/messageController');

const app = express();
const PORT = process.env.PORT || 5000;
const HOSTNAME = process.env.HOSTNAME || 'localhost';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

connectDB();

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Hello World' });
});

const userRoutes = require('./Routes/userRoutes');
const channelRoutes = require('./Routes/channelRoutes');
const messageRoutes = require('./Routes/messageRoutes');

app.use('/api/users', userRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: CLIENT_ORIGIN,
        credentials: true
    }
});

io.use(async (socket, next) => {
    try {
        const headerAuth = socket.handshake.headers?.authorization || '';
        const tokenFromHeader = headerAuth.startsWith('Bearer ') ? headerAuth.split(' ')[1] : null;
        const token = socket.handshake.auth?.token || tokenFromHeader;

        if (!token) {
            return next(new Error('Not authorized'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
            attributes: ['id', 'username', 'avatar']
        });

        if (!user) {
            return next(new Error('Not authorized'));
        }

        socket.data.user = user;
        return next();
    } catch (error) {
        return next(new Error('Not authorized'));
    }
});

io.on('connection', (socket) => {
    const userId = socket.data.user?.id;
    if (userId) {
        socket.join(`user:${userId}`);
    }

    socket.on('join-channel', ({ channelId } = {}) => {
        if (channelId) {
            socket.join(`channel:${channelId}`);
        }
    });

    socket.on('leave-channel', ({ channelId } = {}) => {
        if (channelId) {
            socket.leave(`channel:${channelId}`);
        }
    });

    socket.on('send-message', async (payload = {}, ack) => {
        try {
            const { content, channelId, receiverId } = payload;

            if (!content || !content.trim()) {
                return ack?.({ success: false, message: 'Content is required' });
            }

            if (!channelId && !receiverId) {
                return ack?.({ success: false, message: 'Either channelId or receiverId is required' });
            }

            const messageWithAuthor = await createMessageWithAuthor({
                content: content.trim(),
                authorId: socket.data.user.id,
                channelId,
                receiverId
            });

            if (channelId) {
                io.to(`channel:${channelId}`).emit('message:new', messageWithAuthor);
            }

            if (receiverId) {
                io.to(`user:${receiverId}`).emit('message:new', messageWithAuthor);
                io.to(`user:${socket.data.user.id}`).emit('message:new', messageWithAuthor);
            }

            return ack?.({ success: true, data: messageWithAuthor });
        } catch (error) {
            return ack?.({ success: false, message: error.message });
        }
    });

    socket.on('messages:history', async (payload = {}, ack) => {
        try {
            const {
                channelId,
                limit = 15,
                offset = 0,
                authorUsername,
                contentQuery,
                matchType = 'substring'
            } = payload;

            if (!channelId) {
                return ack?.({ success: false, message: 'channelId is required' });
            }

            const { messages, count, offset: safeOffset } = await fetchMessagesByChannel({
                channelId,
                limit,
                offset,
                authorUsername,
                contentQuery,
                matchType
            });

            return ack?.({
                success: true,
                count: messages.length,
                total: count,
                hasMore: safeOffset + messages.length < count,
                data: messages
            });
        } catch (error) {
            return ack?.({ success: false, message: error.message });
        }
    });
});

server.listen(PORT, HOSTNAME, () => {
    console.log(`ChatterBox API running on http://${HOSTNAME}:${PORT}`);
});
