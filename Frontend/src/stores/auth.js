import { ref, computed } from 'vue';

const currentUser = ref(null);
const authToken = ref(null);

// Load from localStorage on init
const storedUser = localStorage.getItem('chatterbox_user');
const storedToken = localStorage.getItem('chatterbox_token');
if (storedUser && storedToken) {
    try {
        currentUser.value = JSON.parse(storedUser);
        authToken.value = storedToken;
    } catch (e) {
        localStorage.removeItem('chatterbox_user');
        localStorage.removeItem('chatterbox_token');
    }
}

export const useAuth = () => {
    const isAuthenticated = computed(() => !!currentUser.value && !!authToken.value);
    const user = computed(() => currentUser.value);
    const token = computed(() => authToken.value);

    const login = async (email, password) => {
        const response = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (data.success && data.token) {
            currentUser.value = data.data;
            authToken.value = data.token;
            localStorage.setItem('chatterbox_user', JSON.stringify(data.data));
            localStorage.setItem('chatterbox_token', data.token);
            return { success: true };
        }
        return { success: false, message: data.message || 'Login failed' };
    };

    const register = async (username, email, password) => {
        const response = await fetch('http://localhost:5000/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await response.json();

        if (data.success && data.token) {
            currentUser.value = data.data;
            authToken.value = data.token;
            localStorage.setItem('chatterbox_user', JSON.stringify(data.data));
            localStorage.setItem('chatterbox_token', data.token);
            return { success: true };
        }
        return { success: false, message: data.message || 'Registration failed' };
    };

    const logout = () => {
        currentUser.value = null;
        authToken.value = null;
        localStorage.removeItem('chatterbox_user');
        localStorage.removeItem('chatterbox_token');
    };

    return {
        user,
        token,
        isAuthenticated,
        login,
        register,
        logout
    };
};
