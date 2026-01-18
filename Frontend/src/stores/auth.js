import { ref, computed } from 'vue';

const currentUser = ref(null);

// Load from localStorage on init
const stored = localStorage.getItem('chatterbox_user');
if (stored) {
    try {
        currentUser.value = JSON.parse(stored);
    } catch (e) {
        localStorage.removeItem('chatterbox_user');
    }
}

export const useAuth = () => {
    const isAuthenticated = computed(() => !!currentUser.value);
    const user = computed(() => currentUser.value);

    const login = async (email, password) => {
        const response = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (data.success) {
            currentUser.value = data.data;
            localStorage.setItem('chatterbox_user', JSON.stringify(data.data));
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

        if (data.success) {
            currentUser.value = data.data;
            localStorage.setItem('chatterbox_user', JSON.stringify(data.data));
            return { success: true };
        }
        return { success: false, message: data.message || 'Registration failed' };
    };

    const logout = () => {
        currentUser.value = null;
        localStorage.removeItem('chatterbox_user');
    };

    return {
        user,
        isAuthenticated,
        login,
        register,
        logout
    };
};
