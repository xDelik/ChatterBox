<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from './stores/auth.js';
import ChannelTabs from './components/ChannelTabs.vue';
import MessageList from './components/MessageList.vue';
import MessageForm from './components/MessageForm.vue';
import { getChannelById } from './services/api.js';

const route = useRoute();
const router = useRouter();
const { user, isAuthenticated, logout } = useAuth();

const selectedChannel = ref(null);
const messageListRef = ref(null);

const isAuthPage = computed(() => {
    return route.name === 'login' || route.name === 'register';
});

watch(
    () => route.params.channelId,
    async (channelId) => {
        if (channelId) {
            const response = await getChannelById(channelId);
            if (response.success) {
                selectedChannel.value = response.data;
            }
        } else {
            selectedChannel.value = null;
        }
    },
    { immediate: true }
);

function onChannelSelected(channel) {
    selectedChannel.value = channel;
}

function onMessageSent() {
    if (messageListRef.value) {
        messageListRef.value.fetchMessages();
    }
}

function handleLogout() {
    logout();
    router.push('/login');
}

function getCurrentTime() {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
}
</script>

<template>
    <div class="app">
        <!-- Auth Pages (Login/Register) -->
        <router-view v-if="isAuthPage" />

        <!-- Main Chat Interface -->
        <div v-else-if="isAuthenticated" class="terminal">
            <header class="terminal-header">
                <div class="title-bar">
                    <span class="title">[ CHATTERBOX v1.0.0 ]</span>
                    <div class="user-info">
                        <span class="user-label">USER:</span>
                        <span class="username">{{ user?.username }}</span>
                        <span class="separator">|</span>
                        <button class="logout-btn" @click="handleLogout">[LOGOUT]</button>
                    </div>
                </div>
                <div class="status-bar">
                    <span class="status-item">
                        <span class="prefix">[+]</span> Connected
                    </span>
                    <span class="separator">|</span>
                    <span class="status-item time">{{ getCurrentTime() }}</span>
                </div>
            </header>

            <ChannelTabs @channel-selected="onChannelSelected" />

            <main class="terminal-main">
                <div class="chat-container">
                    <div class="channel-info" v-if="selectedChannel">
                        <span class="path">~/channels/{{ selectedChannel.name }}</span>
                        <span v-if="selectedChannel.description" class="desc">
                            // {{ selectedChannel.description }}
                        </span>
                    </div>
                    <div class="channel-info placeholder" v-else>
                        <span class="path">~/channels/[select a channel]</span>
                    </div>

                    <MessageList
                        ref="messageListRef"
                        :channel-id="selectedChannel?.id"
                    />

                    <MessageForm
                        :channel-id="selectedChannel?.id"
                        :current-user-id="user?.id"
                        @message-sent="onMessageSent"
                    />
                </div>
            </main>

            <footer class="terminal-footer">
                <span class="footer-text">
                    CONN: OK | PING: {{ Math.floor(Math.random() * 50) + 10 }}ms |
                    CH: {{ selectedChannel?.name || 'none' }} |
                    [?] /help
                </span>
            </footer>
        </div>
    </div>
</template>

<style>
.app {
    min-height: 100vh;
    background-color: var(--bg-primary);
}

.terminal {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-primary);
}

.terminal-header {
    border-bottom: 1px solid var(--border-dim);
    background-color: var(--bg-secondary);
}

.title-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    border-bottom: 1px solid var(--border-dim);
}

.title {
    color: var(--text-bright);
    font-weight: 600;
    letter-spacing: 2px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.user-label {
    color: var(--text-dim);
}

.username {
    color: var(--accent);
    font-weight: 500;
}

.separator {
    color: var(--border-dim);
}

.logout-btn {
    background: transparent;
    border: 1px solid var(--border-dim);
    color: var(--text-secondary);
    padding: 4px 10px;
    font-family: inherit;
    font-size: 0.85em;
    cursor: pointer;
    transition: all 0.1s;
}

.logout-btn:hover {
    border-color: var(--error);
    color: var(--error);
}

.status-bar {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 6px 15px;
    font-size: 0.85em;
    background-color: var(--bg-tertiary);
}

.status-item {
    color: var(--text-secondary);
}

.status-item .prefix {
    color: var(--text-primary);
}

.status-item.time {
    color: var(--text-dim);
}

.terminal-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
}

.chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    background-color: var(--bg-secondary);
    border-left: 1px solid var(--border-dim);
    border-right: 1px solid var(--border-dim);
}

.channel-info {
    padding: 10px 15px;
    border-bottom: 1px solid var(--border-dim);
    background-color: var(--bg-tertiary);
    display: flex;
    align-items: center;
    gap: 15px;
}

.channel-info.placeholder {
    color: var(--text-dim);
}

.channel-info .path {
    color: var(--accent);
    font-weight: 500;
}

.channel-info .desc {
    color: var(--text-dim);
    font-style: italic;
}

.terminal-footer {
    border-top: 1px solid var(--border-dim);
    padding: 8px 15px;
    background-color: var(--bg-secondary);
}

.footer-text {
    color: var(--text-dim);
    font-size: 0.8em;
    letter-spacing: 1px;
}
</style>
