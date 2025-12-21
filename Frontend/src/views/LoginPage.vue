<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../stores/auth.js';

const router = useRouter();
const { login } = useAuth();

const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref(null);

async function handleSubmit() {
    if (!username.value || !password.value) {
        error.value = 'All fields required';
        return;
    }

    loading.value = true;
    error.value = null;

    const result = await login(username.value, password.value);

    if (result.success) {
        router.push('/');
    } else {
        error.value = result.message;
    }

    loading.value = false;
}
</script>

<template>
    <div class="login-page">
        <div class="terminal-window">
            <div class="terminal-header">
                <span class="title">[ CHATTERBOX - AUTHENTICATION ]</span>
            </div>

            <div class="terminal-body">
<pre class="ascii-art">
  ______   __                   __      __                          _______
 /      \ |  \                 |  \    |  \                        |       \
|  $$$$$$\| $$____    ______  _| $$_  _| $$_     ______    ______  | $$$$$$$\  ______   __    __
| $$   \$$| $$    \  |      \|   $$ \|   $$ \   /      \  /      \ | $$__/ $$ /      \ |  \  /  \
| $$      | $$$$$$$\  \$$$$$$\\$$$$$$ \$$$$$$  |  $$$$$$\|  $$$$$$\| $$    $$|  $$$$$$\ \$$\/  $$
| $$   __ | $$  | $$ /      $$ | $$ __ | $$ __ | $$    $$| $$   \$$| $$$$$$$\| $$  | $$  >$$  $$
| $$__/  \| $$  | $$|  $$$$$$$ | $$|  \| $$|  \| $$$$$$$$| $$      | $$__/ $$| $$__/ $$ /  $$$$\
 \$$    $$| $$  | $$ \$$    $$  \$$  $$ \$$  $$ \$$     \| $$      | $$    $$ \$$    $$|  $$ \$$\
  \$$$$$$  \$$   \$$  \$$$$$$$   \$$$$   \$$$$   \$$$$$$$ \$$       \$$$$$$$   \$$$$$$  \$$   \$$
</pre>

                <div class="boot-sequence">
                    <p>[OK] System initialized</p>
                    <p>[OK] Network connection established</p>
                    <p>[**] Awaiting user authentication...</p>
                </div>

                <form @submit.prevent="handleSubmit" class="login-form">
                    <div class="prompt-line">
                        <span class="prompt">login:</span>
                        <input
                            v-model="username"
                            type="text"
                            placeholder="username"
                            :disabled="loading"
                            autofocus
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

                    <div v-if="error" class="error-line">
                        <span class="prefix">[!] ERROR:</span> {{ error }}
                    </div>

                    <div class="actions">
                        <button type="submit" :disabled="loading">
                            [{{ loading ? 'AUTHENTICATING...' : 'LOGIN' }}]
                        </button>
                    </div>
                </form>

                <div class="register-link">
                    <span class="dim">No account?</span>
                    <router-link to="/register">[REGISTER NEW USER]</router-link>
                </div>
            </div>

            <div class="terminal-footer">
                <span>SECURE CONNECTION | TLS 1.3 | READY</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background-color: var(--bg-primary);
}

.terminal-window {
    width: 100%;
    max-width: 570px;
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
    color: var(--text-primary);
    font-size: 9px;
    line-height: 1.1;
    margin: 0 0 20px 0;
    overflow-x: auto;
    font-family: inherit;
}

.boot-sequence {
    margin-bottom: 25px;
    font-size: 0.9em;
}

.boot-sequence p {
    margin: 4px 0;
    color: var(--text-secondary);
}

.login-form {
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
    min-width: 70px;
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
    border-color: var(--text-primary);
    box-shadow: 0 0 10px var(--text-dim);
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

.prefix {
    font-weight: 600;
}

.actions {
    margin-top: 10px;
}

.actions button {
    width: 100%;
    padding: 12px 20px;
    background-color: var(--bg-primary);
    border: 1px solid var(--text-primary);
    color: var(--text-primary);
    font-family: inherit;
    font-size: 1em;
    cursor: pointer;
    transition: all 0.1s;
}

.actions button:hover:not(:disabled) {
    background-color: var(--selection-bg);
    box-shadow: 0 0 15px var(--text-dim);
}

.actions button:disabled {
    border-color: var(--border-dim);
    color: var(--text-dim);
    cursor: wait;
}

.register-link {
    margin-top: 25px;
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid var(--border-dim);
}

.register-link .dim {
    color: var(--text-dim);
    margin-right: 10px;
}

.register-link a {
    color: var(--accent);
    text-decoration: none;
}

.register-link a:hover {
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
