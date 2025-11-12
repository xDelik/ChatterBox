require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Hello World' });
});

const channelRoutes = require('./routes/channelRoutes');
const messageRoutes = require('./routes/messageRoutes');

app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);

app.listen(PORT, () => {
    console.log(`ChatterBox API running on http://localhost:${PORT}`);
});