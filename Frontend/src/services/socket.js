import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
let socketInstance = null;
let currentToken = null;

export function getSocket() {
    const token = localStorage.getItem('chatterbox_token');

    if (!socketInstance || currentToken !== token) {
        if (socketInstance) {
            socketInstance.disconnect();
        }
        currentToken = token;
        socketInstance = io(SOCKET_URL, {
            auth: { token },
            autoConnect: true
        });
    }

    return socketInstance;
}

export function connectSocket(timeoutMs = 5000) {
    const socket = getSocket();

    if (socket.connected) {
        return Promise.resolve(socket);
    }

    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            socket.off('connect', handleConnect);
            socket.off('connect_error', handleError);
            reject(new Error('Socket connection timed out'));
        }, timeoutMs);

        const handleConnect = () => {
            clearTimeout(timeoutId);
            socket.off('connect_error', handleError);
            resolve(socket);
        };

        const handleError = (err) => {
            clearTimeout(timeoutId);
            socket.off('connect', handleConnect);
            reject(err);
        };

        socket.once('connect', handleConnect);
        socket.once('connect_error', handleError);
        socket.connect();

        if (socket.connected) {
            handleConnect();
        }
    });
}

export function disconnectSocket() {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        currentToken = null;
    }
}
