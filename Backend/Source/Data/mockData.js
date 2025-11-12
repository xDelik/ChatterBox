let channels = [
    { id: 1, name: 'general', description: 'General discussion', createdAt: new Date() },
    { id: 2, name: 'random', description: 'Random stuff', createdAt: new Date() },
    { id: 3, name: 'tech', description: 'Tech talk', createdAt: new Date() }
];

let messages = [
    { id: 1, channelId: 1, author: 'John', content: 'Hello everyone!', createdAt: new Date() },
    { id: 2, channelId: 1, author: 'Jane', content: 'Hi John!', createdAt: new Date() },
    { id: 3, channelId: 2, author: 'Bob', content: 'Random message here', createdAt: new Date() }
];

let nextChannelId = 4;
let nextMessageId = 4;

module.exports = {
    channels,
    messages,
    getNextChannelId: () => nextChannelId++,
    getNextMessageId: () => nextMessageId++
};