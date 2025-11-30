<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import { getChannels } from '../services/api.js';

const channels = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedChannelId = ref(null);

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
    selectedChannelId.value = channel.id;
    emit('channel-selected', channel);
}

onMounted(fetchChannels);

defineExpose({ fetchChannels });
</script>

<template>
    <div class="channel-list">
        <h3>Channels</h3>
        <div v-if="loading">Loading channels...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <ul v-else>
            <li
                v-for="channel in channels"
                :key="channel.id"
                :class="{ selected: selectedChannelId === channel.id }"
                @click="selectChannel(channel)"
            >
                <span class="channel-icon">#</span>
                {{ channel.name }}
            </li>
        </ul>
    </div>
</template>

<style scoped>
.channel-list {
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 4px;
}

.channel-list h3 {
    margin-top: 0;
}

.channel-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.channel-list li {
    padding: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
}

.channel-list li:hover {
    background-color: #f0f0f0;
}

.channel-list li.selected {
    background-color: #e0e0ff;
}

.channel-icon {
    color: #666;
    font-weight: bold;
}

.error {
    color: red;
}
</style>
