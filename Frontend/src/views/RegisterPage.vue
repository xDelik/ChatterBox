<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../stores/auth.js';

const router = useRouter();
const { register } = useAuth();

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref(null);

async function handleSubmit() {
    if (!username.value || !email.value || !password.value || !confirmPassword.value) {
        error.value = 'All fields required';
        return;
    }

    if (password.value !== confirmPassword.value) {
        error.value = 'Passwords do not match';
        return;
    }

    if (password.value.length < 4) {
        error.value = 'Password must be at least 4 characters';
        return;
    }

    loading.value = true;
    error.value = null;

    const result = await register(username.value, email.value, password.value);

    if (result.success) {
        router.push('/');
    } else {
        error.value = result.message;
    }

    loading.value = false;
}
</script>

<template>
    <div class="register-page">
        <div class="terminal-window">
            <div class="terminal-header">
                <span class="title">[ CHATTERBOX - NEW USER REGISTRATION ]</span>
            </div>

            <div class="terminal-body">
        <pre class="ascii-art">
         __    __                                __    __
        |  \  |  \                              |  \  |  \
        | $$\ | $$  ______   __   __   __       | $$  | $$  _______   ______    ______
        | $$$\| $$ /      \ |  \ |  \ |  \      | $$  | $$ /       \ /      \  /      \
        | $$$$\ $$|  $$$$$$\| $$ | $$ | $$      | $$  | $$|  $$$$$$$|  $$$$$$\|  $$$$$$\
        | $$\$$ $$| $$    $$| $$ | $$ | $$      | $$  | $$ \$$    \ | $$    $$| $$   \$$
        | $$ \$$$$| $$$$$$$$| $$_/ $$_/ $$      | $$__/ $$ _\$$$$$$\| $$$$$$$$| $$
        | $$  \$$$ \$$     \ \$$   $$   $$       \$$    $$|       $$ \$$     \| $$
         \$$   \$$  \$$$$$$$  \$$$$$\$$$$         \$$$$$$  \$$$$$$$   \$$$$$$$ \$$

        </pre>

                <div class="info-text">
                    <p><span class="prefix">&gt;</span> useradd --create-home --shell /bin/chatterbox</p>
                    <p class="dim">Creating new user account...</p>
                </div>

                <form @submit.prevent="handleSubmit" class="register-form">
                    <div class="prompt-line">
                        <span class="prompt">username:</span>
                        <input
                            v-model="username"
                            type="text"
                            placeholder="choose username"
                            :disabled="loading"
                            autofocus
                        />
                    </div>

                    <div class="prompt-line">
                        <span class="prompt">email:</span>
                        <input
                            v-model="email"
                            type="email"
                            placeholder="user@domain.com"
                            :disabled="loading"
                        />
                    </div>

                    <div class="prompt-line">
                        <span class="prompt">passwd:</span>
                        <input
                            v-model="password"
                            type="password"
                            placeholder="********"
                            :disabled="loading"
                        />
                    </div>

                    <div class="prompt-line">
                        <span class="prompt">confirm:</span>
                        <input
                            v-model="confirmPassword"
                            type="password"
                            placeholder="********"
                            :disabled="loading"
                        />
                    </div>

                    <div v-if="error" class="error-line">
                        <span class="prefix">[!] ERROR:</span> {{ error }}
                    </div>

                    <div class="actions">
                        <button type="submit" :disabled="loading">
                            [{{ loading ? 'CREATING USER...' : 'CREATE ACCOUNT' }}]
                        </button>
                    </div>
                </form>

                <div class="login-link">
                    <span class="dim">Already have an account?</span>
                    <router-link to="/login">[LOGIN]</router-link>
                </div>
            </div>

            <div class="terminal-footer">
                <span>SECURE CONNECTION | TLS 1.3 | READY</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.register-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background-color: var(--bg-primary);
}

.terminal-window {
    width: 100%;
    max-width: 600px;
    border: 1px solid var(--border-dim);
    background-color: var(--bg-secondary);
}

.terminal-header {
    padding: 10px 15px;
    border-bottom: 1px solid var(--border-dim);
    background-color: var(--bg-tertiary);
}

.title {
    color: var(--text-bright);
    font-weight: 600;
    letter-spacing: 2px;
}

.terminal-body {
    padding: 20px;
}

.ascii-art {
    color: var(--accent);
    font-size: 10px;
    line-height: 1.2;
    margin-bottom: 20px;
    white-space: pre;
    overflow-x: auto;
}

.info-text {
    margin-bottom: 25px;
}

.info-text p {
    margin: 4px 0;
    color: var(--text-secondary);
}

.info-text .dim {
    color: var(--text-dim);
    padding-left: 20px;
}

.prefix {
    color: var(--text-bright);
}

.register-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.prompt-line {
    display: flex;
    align-items: center;
    gap: 10px;
}

.prompt {
    color: var(--accent);
    min-width: 80px;
}

.prompt-line input {
    flex: 1;
    padding: 10px 12px;
    background-color: var(--bg-primary);
    border: 1px solid var(--border-dim);
    color: var(--text-primary);
    font-family: inherit;
    font-size: inherit;
}

.prompt-line input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.prompt-line input::placeholder {
    color: var(--text-dim);
}

.error-line {
    color: var(--error);
    padding: 10px;
    border: 1px solid var(--error);
    background-color: rgba(255, 51, 51, 0.1);
}

.actions {
    margin-top: 10px;
}

.actions button {
    width: 100%;
    padding: 12px 20px;
    background-color: var(--bg-primary);
    border: 1px solid var(--accent);
    color: var(--accent);
    font-family: inherit;
    font-size: 1em;
    cursor: pointer;
    transition: all 0.1s;
}

.actions button:hover:not(:disabled) {
    background-color: rgba(0, 255, 255, 0.1);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
}

.actions button:disabled {
    border-color: var(--border-dim);
    color: var(--text-dim);
    cursor: wait;
}

.login-link {
    margin-top: 25px;
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid var(--border-dim);
}

.login-link .dim {
    color: var(--text-dim);
    margin-right: 10px;
}

.login-link a {
    color: var(--text-primary);
    text-decoration: none;
}

.login-link a:hover {
    text-decoration: underline;
}

.terminal-footer {
    padding: 8px 15px;
    border-top: 1px solid var(--border-dim);
    background-color: var(--bg-tertiary);
    color: var(--text-dim);
    font-size: 0.8em;
    text-align: center;
}
</style>
