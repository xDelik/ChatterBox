const API_BASE_URL = 'http://localhost:5000/api';

export async function getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`);
    const data = await response.json();
    return data;
}

export async function getUserById(id) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    const data = await response.json();
    return data;
}

export async function getChannels() {
    const response = await fetch(`${API_BASE_URL}/channels`);
    const data = await response.json();
    return data;
}

export async function getChannelById(id) {
    const response = await fetch(`${API_BASE_URL}/channels/${id}`);
    const data = await response.json();
    return data;
}

export async function getMessagesByChannel(channelId, { limit = 15, offset = 0 } = {}) {
    const params = new URLSearchParams({ limit, offset });
    const response = await fetch(`${API_BASE_URL}/messages/channel/${channelId}?${params.toString()}`);
    const data = await response.json();
    return data;
}

export async function sendMessage(content, authorId, channelId) {
    const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, authorId, channelId })
    });
    const data = await response.json();
    return data;
}

export async function createChannel(name, description, createdBy) {
    const response = await fetch(`${API_BASE_URL}/channels`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description, createdBy })
    });
    const data = await response.json();
    return data;
}
