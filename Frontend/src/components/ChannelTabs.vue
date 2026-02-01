<script setup>
import { ref, onMounted, defineEmits, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getChannels, createChannel as apiCreateChannel } from '../services/api.js';
import { useAuth } from '../stores/auth.js';

const route = useRoute();
const router = useRouter();
const { user } = useAuth();

const channels = ref([]);
const loading = ref(true);
const error = ref(null);
const showNewChannel = ref(false);
const newChannelName = ref('');
const newChannelDesc = ref('');
const creating = ref(false);

const selectedChannelId = computed(() => {
    return route.params.channelId ? Number(route.params.channelId) : null;
});

const emit = defineEmits(['channel-selected']);

async function fetchChannels() {
    try {
        loading.value = true;
        const response = await getChannels();
        if (response.success) {
            channels.value = response.data;
        } else {
            error.value = response.message;
        }
    } catch (e) {
        error.value = 'Failed to fetch channels';
    } finally {
        loading.value = false;
    }
}

function selectChannel(channel) {
    emit('channel-selected', channel);
    router.push({ name: 'channel', params: { channelId: channel.id } });
}

async function createChannel() {
    if (!newChannelName.value.trim() || !user.value) return;

    creating.value = true;
    try {
        const data = await apiCreateChannel(
            newChannelName.value.trim(),
            newChannelDesc.value.trim(),
            user.value.id
        );

        if (data.success) {
            newChannelName.value = '';
            newChannelDesc.value = '';
            showNewChannel.value = false;
            await fetchChannels();
            selectChannel(data.data);
        } else {
            error.value = data.message;
        }
    } catch (e) {
        error.value = 'Failed to create channel';
    } finally {
        creating.value = false;
    }
}

onMounted(fetchChannels);

defineExpose({ fetchChannels });
</script>

<template>
    <div class="channel-tabs">
        <div class="tabs-container">
            <div v-if="loading" class="loading-tab">
                [*] Loading...
            </div>
            <template v-else>
                <button
                    v-for="channel in channels"
                    :key="channel.id"
                    class="tab"
                    :class="{ active: selectedChannelId === channel.id }"
                    @click="selectChannel(channel)"
                >
                    <span class="hash">#</span>{{ channel.name }}
                </button>
            </template>

            <button
                class="tab new-tab"
                :class="{ active: showNewChannel }"
                @click="showNewChannel = !showNewChannel"
            >
                [+]
            </button>
        </div>

        <div v-if="showNewChannel" class="new-channel-form">
            <div class="form-row">
                <span class="prompt">mkdir #</span>
                <input
                    v-model="newChannelName"
                    type="text"
                    placeholder="channel-name"
                    @keyup.enter="createChannel"
                    :disabled="creating"
                />
                <input
                    v-model="newChannelDesc"
                    type="text"
                    placeholder="description (optional)"
                    class="desc-input"
                    :disabled="creating"
                />
                <button @click="createChannel" :disabled="creating || !newChannelName.trim()">
                    [{{ creating ? 'WAIT' : 'CREATE' }}]
                </button>
                <button class="cancel" @click="showNewChannel = false">
                    [X]
                </button>
            </div>
            <div v-if="error" class="error-msg">
                [!] {{ error }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.channel-tabs {
    background-color: var(--bg-tertiary);
    border-bottom: 1px solid var(--border-dim);
}

.tabs-container {
    display: flex;
    align-items: stretch;
    overflow-x: auto;
    scrollbar-width: thin;
}

.tabs-container::-webkit-scrollbar {
    height: 4px;
}

.loading-tab {
    padding: 10px 15px;
    color: var(--text-dim);
}

.tab {
    padding: 10px 15px;
    background: transparent;
    border: none;
    border-right: 1px solid var(--border-dim);
    color: var(--text-secondary);
    font-family: inherit;
    font-size: inherit;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.1s;
}

.tab:hover {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
}

.tab.active {
    background-color: var(--bg-secondary);
    color: var(--text-bright);
    border-bottom: 2px solid var(--text-primary);
}

.tab .hash {
    color: var(--text-dim);
    margin-right: 2px;
}

.tab.active .hash {
    color: var(--text-primary);
}

.new-tab {
    color: var(--accent);
    border-right: none;
}

.new-tab:hover {
    color: var(--text-bright);
}

.new-tab.active {
    background-color: var(--bg-secondary);
    border-bottom-color: var(--accent);
}

.new-channel-form {
    padding: 10px 15px;
    background-color: var(--bg-secondary);
    border-top: 1px solid var(--border-dim);
}

.form-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.prompt {
    color: var(--accent);
}

.form-row input {
    padding: 6px 10px;
    background-color: var(--bg-primary);
    border: 1px solid var(--border-dim);
    color: var(--text-primary);
    font-family: inherit;
    font-size: inherit;
}

.form-row input:focus {
    outline: none;
    border-color: var(--accent);
}

.form-row input::placeholder {
    color: var(--text-dim);
}

.desc-input {
    flex: 1;
    min-width: 150px;
}

.form-row button {
    padding: 6px 12px;
    background-color: var(--bg-primary);
    border: 1px solid var(--border-dim);
    color: var(--text-secondary);
    font-family: inherit;
    font-size: inherit;
    cursor: pointer;
    transition: all 0.1s;
}

.form-row button:first-of-type {
    border-color: var(--accent);
    color: var(--accent);
}

.form-row button:first-of-type:hover:not(:disabled) {
    background-color: rgba(0, 255, 255, 0.1);
}

.form-row button:disabled {
    color: var(--text-dim);
    border-color: var(--border-dim);
    cursor: not-allowed;
}

.form-row button.cancel:hover {
    border-color: var(--warning);
    color: var(--warning);
}

.error-msg {
    margin-top: 8px;
    color: var(--error);
    font-size: 0.9em;
}
</style>
