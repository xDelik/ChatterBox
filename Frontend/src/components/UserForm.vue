<script setup>
import { ref, defineEmits } from 'vue';

const emit = defineEmits(['user-created']);

const username = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref(null);
const showForm = ref(false);

async function handleSubmit() {
    if (!username.value || !email.value || !password.value) return;

    try {
        loading.value = true;
        error.value = null;

        const response = await fetch('http://localhost:5000/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username.value,
                email: email.value,
                password: password.value
            })
        });

        const data = await response.json();

        if (data.success) {
            username.value = '';
            email.value = '';
            password.value = '';
            showForm.value = false;
            emit('user-created', data.data);
        } else {
            error.value = data.message;
        }
    } catch (e) {
        error.value = 'Failed to create user';
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="user-form">
        <button v-if="!showForm" @click="showForm = true" class="toggle-btn">
            + Add User
        </button>

        <form v-else @submit.prevent="handleSubmit">
            <div v-if="error" class="error">{{ error }}</div>

            <input
                v-model="username"
                type="text"
                placeholder="Username"
                :disabled="loading"
            />
            <input
                v-model="email"
                type="email"
                placeholder="Email"
                :disabled="loading"
            />
            <input
                v-model="password"
                type="password"
                placeholder="Password"
                :disabled="loading"
            />

            <div class="buttons">
                <button type="submit" :disabled="loading">
                    {{ loading ? 'Creating...' : 'Create' }}
                </button>
                <button type="button" @click="showForm = false" class="cancel">
                    Cancel
                </button>
            </div>
        </form>
    </div>
</template>

<style scoped>
.user-form {
    margin-top: 10px;
}

.toggle-btn {
    width: 100%;
    padding: 8px;
    background: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.toggle-btn:hover {
    background: #45a049;
}

form {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.buttons {
    display: flex;
    gap: 8px;
}

button {
    flex: 1;
    padding: 8px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button[type="submit"] {
    background: #4caf50;
    color: white;
}

button.cancel {
    background: #ccc;
}

.error {
    color: red;
    font-size: 0.9em;
}
</style>
