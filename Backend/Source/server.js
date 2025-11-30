require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./Config/db');

const app = express();
const PORT = process.env.PORT || 5000;
const HOSTNAME = process.env.HOSTNAME || 'localhost';

connectDB();

app.use(cors());
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

app.listen(PORT, HOSTNAME, () => {
    console.log(`ChatterBox API running on http://${HOSTNAME}:${PORT}`);
});