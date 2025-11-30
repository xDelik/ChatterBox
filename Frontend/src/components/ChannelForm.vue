<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
    currentUserId: {
        type: String,
        default: null
    }
});

const emit = defineEmits(['channel-created']);

const name = ref('');
const description = ref('');
const loading = ref(false);
const error = ref(null);
const showForm = ref(false);

async function handleSubmit() {
    if (!name.value || !props.currentUserId) return;

    try {
        loading.value = true;
        error.value = null;

        const response = await fetch('http://localhost:5000/api/channels', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name.value,
                description: description.value,
                createdBy: props.currentUserId
            })
        });

        const data = await response.json();

        if (data.success) {
            name.value = '';
            description.value = '';
            showForm.value = false;
            emit('channel-created', data.data);
        } else {
            error.value = data.message;
        }
    } catch (e) {
        error.value = 'Failed to create channel';
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="channel-form">
        <button
            v-if="!showForm"
            @click="showForm = true"
            class="toggle-btn"
            :disabled="!currentUserId"
            :title="!currentUserId ? 'Select a user first' : ''"
        >
            + Add Channel
        </button>

        <form v-else @submit.prevent="handleSubmit">
            <div v-if="error" class="error">{{ error }}</div>

            <input
                v-model="name"
                type="text"
                placeholder="Channel name"
                :disabled="loading"
            />
            <input
                v-model="description"
                type="text"
                placeholder="Description (optional)"
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
.channel-form {
    margin-top: 10px;
}

.toggle-btn {
    width: 100%;
    padding: 8px;
    background: #2196f3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.toggle-btn:hover:not(:disabled) {
    background: #1976d2;
}

.toggle-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
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
    background: #2196f3;
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
