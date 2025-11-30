<script setup>
import { ref, watch, defineProps } from 'vue';
import { getMessagesByChannel } from '../services/api.js';

const props = defineProps({
    channelId: {
        type: String,
        default: null
    }
});

const messages = ref([]);
const loading = ref(false);
const error = ref(null);

async function fetchMessages() {
    if (!props.channelId) {
        messages.value = [];
        return;
    }

    try {
        loading.value = true;
        error.value = null;
        const response = await getMessagesByChannel(props.channelId);
        if (response.success) {
            messages.value = response.data;
        } else {
            error.value = response.message;
        }
    } catch (e) {
        error.value = 'Failed to fetch messages';
    } finally {
        loading.value = false;
    }
}

watch(() => props.channelId, fetchMessages, { immediate: true });

defineExpose({ fetchMessages });
</script>

<template>
    <div class="message-list">
        <div v-if="!channelId" class="placeholder">
            Select a channel to view messages
        </div>
        <div v-else-if="loading">Loading messages...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="messages.length === 0" class="placeholder">
            No messages in this channel yet
        </div>
        <div v-else class="messages">
            <div
                v-for="message in messages"
                :key="message.id"
                class="message"
            >
                <div class="message-header">
                    <span class="author">{{ message.author?.username || 'Unknown' }}</span>
                    <span class="time">{{ new Date(message.createdAt).toLocaleString() }}</span>
                </div>
                <div class="message-content">{{ message.content }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.message-list {
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 4px;
    height: 300px;
    overflow-y: auto;
}

.placeholder {
    color: #666;
    text-align: center;
    padding: 20px;
}

.messages {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.message {
    padding: 8px;
    background-color: #f9f9f9;
    border-radius: 4px;
}

.message-header {
    display: flex;
    gap: 10px;
    margin-bottom: 4px;
}

.author {
    font-weight: bold;
    color: #333;
}

.time {
    color: #888;
    font-size: 0.85em;
}

.message-content {
    color: #444;
}

.error {
    color: red;
}
</style>
