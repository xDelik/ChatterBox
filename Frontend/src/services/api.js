const API_BASE_URL = 'http://localhost:5000/api';

function getToken() {
    return localStorage.getItem('chatterbox_token');
}

function getAuthHeaders() {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

async function handleResponse(response) {
    const data = await response.json();
    if (response.status === 401) {
        localStorage.removeItem('chatterbox_user');
        localStorage.removeItem('chatterbox_token');
        window.location.href = '/login';
        return data;
    }
    return data;
}

export async function getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
}

export async function getUserById(id) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
}

export async function getMe() {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
}

export async function getChannels() {
    const response = await fetch(`${API_BASE_URL}/channels`, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
}

export async function getChannelById(id) {
    const response = await fetch(`${API_BASE_URL}/channels/${id}`, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
}

export async function getMessagesByChannel(
    channelId,
    { limit = 15, offset = 0, authorUsername, contentQuery, matchType } = {}
) {
    const params = new URLSearchParams({ limit, offset });

    if (authorUsername) params.append('authorUsername', authorUsername);
    if (contentQuery) params.append('contentQuery', contentQuery);
    if (matchType) params.append('matchType', matchType);

    const response = await fetch(`${API_BASE_URL}/messages/channel/${channelId}?${params.toString()}`, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
}

export async function sendMessage(content, authorId, channelId) {
    const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content, authorId, channelId })
    });
    return handleResponse(response);
}

export async function createChannel(name, description, createdBy) {
    const response = await fetch(`${API_BASE_URL}/channels`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, description, createdBy })
    });
    return handleResponse(response);
}
