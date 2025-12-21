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
            <span class="prefix">[?]</span> Select a channel and user to enable input
        </div>
        <form v-else @submit.prevent="handleSubmit">
            <div v-if="error" class="error-line">
                <span class="prefix">[!]</span> {{ error }}
            </div>
            <div class="input-row">
                <span class="prompt">&gt;</span>
                <input
                    v-model="content"
                    type="text"
                    :placeholder="sending ? 'sending...' : 'enter message...'"
                    ref="inputRef"
                    :disabled="sending"
                />
                <button type="submit" :disabled="sending || !content.trim()">
                    [{{ sending ? 'WAIT' : 'SEND' }}]
                </button>
            </div>
        </form>
    </div>
</template>

<style scoped>
.message-form {
    padding: 10px 12px;
    border-top: 1px solid var(--border-dim);
    background-color: var(--bg-tertiary);
}

.placeholder {
    color: var(--text-dim);
    padding: 4px 0;
}

.prefix {
    color: var(--text-dim);
    margin-right: 8px;
}

.error-line {
    color: var(--error);
    margin-bottom: 8px;
    font-size: 0.9em;
}

.input-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.prompt {
    color: var(--text-bright);
    font-weight: 600;
}

input {
    flex: 1;
    padding: 8px 12px;
    background-color: var(--bg-primary);
    border: 1px solid var(--border-dim);
    color: var(--text-primary);
    font-family: inherit;
    font-size: inherit;
}

input:focus {
    outline: none;
    border-color: var(--text-primary);
    box-shadow: 0 0 5px var(--text-dim);
}

input::placeholder {
    color: var(--text-dim);
}

input:disabled {
    opacity: 0.6;
}

button {
    padding: 8px 16px;
    background-color: var(--bg-primary);
    border: 1px solid var(--text-primary);
    color: var(--text-primary);
    font-family: inherit;
    font-size: inherit;
    cursor: pointer;
    transition: all 0.1s;
}

button:hover:not(:disabled) {
    background-color: var(--selection-bg);
    box-shadow: 0 0 10px var(--text-dim);
}

button:disabled {
    border-color: var(--border-dim);
    color: var(--text-dim);
    cursor: not-allowed;
}
</style>
