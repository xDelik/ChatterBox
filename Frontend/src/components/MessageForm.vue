<script setup>
import { ref, defineProps, defineEmits, onMounted, watch, nextTick } from 'vue';
import { sendMessage } from '../services/api.js';

const props = defineProps({
    channelId: {
        type: String,
        default: null
    },
    currentUserId: {
        type: String,
        default: null
    }
});

const emit = defineEmits(['message-sent']);

const content = ref('');
const sending = ref(false);
const error = ref(null);
const inputRef = ref(null);

async function handleSubmit() {
    if (!content.value.trim() || !props.channelId || !props.currentUserId) {
        return;
    }

    try {
        sending.value = true;
        error.value = null;
        const response = await sendMessage(content.value, props.currentUserId, props.channelId);
        if (response.success) {
            content.value = '';
            emit('message-sent', response.data);
            inputRef.value?.focus();
        } else {
            error.value = response.message;
        }
    } catch (e) {
        error.value = 'Failed to send message';
    } finally {
        sending.value = false;
    }
}

onMounted(() => {
    if (inputRef.value) {
        inputRef.value.focus();
    }
});

watch(
    () => props.channelId,
    () => {
        nextTick(() => {
            inputRef.value?.focus();
        });
    }
);
</script>

<template>
    <div class="message-form">
        <div v-if="!channelId || !currentUserId" class="placeholder">
            Select a channel and user to send messages
        </div>
        <form v-else @submit.prevent="handleSubmit">
            <div v-if="error" class="error">{{ error }}</div>
            <div class="input-row">
                <input
                    v-model="content"
                    type="text"
                    placeholder="Type a message..."
                    ref="inputRef"
                />
                <button type="submit" :disabled="sending || !content.trim()">
                    {{ sending ? 'Sending...' : 'Send' }}
                </button>
            </div>
        </form>
    </div>
</template>

<style scoped>
.message-form {
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 4px;
}

.placeholder {
    color: #666;
    text-align: center;
    padding: 10px;
}

.input-row {
    display: flex;
    gap: 10px;
}

input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

button {
    padding: 8px 16px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover:not(:disabled) {
    background-color: #45a049;
}

button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.error {
    color: red;
    margin-bottom: 10px;
}
</style>
