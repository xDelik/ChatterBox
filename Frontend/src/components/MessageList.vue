<script setup>
import { ref, watch, defineProps, nextTick, onBeforeUnmount } from 'vue';
import { getMessagesByChannel } from '../services/api.js';

const props = defineProps({
    channelId: {
        type: String,
        default: null
    }
});

const messages = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const error = ref(null);
const hasMore = ref(true);
const newMessagesAvailable = ref(false);
const autoScrollEnabled = ref(true);
const lastScrollTop = ref(0);
const messageListRef = ref(null);
const searchTerm = ref('');
const filterMode = ref('content');
const matchType = ref('substring');
const activeFilters = ref({
    authorUsername: null,
    contentQuery: null,
    matchType: 'substring'
});
let pollingInterval = null;
const POLL_INTERVAL_MS = 3000;
const PAGE_SIZE = 15;
const BOTTOM_THRESHOLD = 5;

const normalizeMessages = (list = []) =>
    [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

const isNearBottom = (container) => {
    if (!container) return true;
    const distance = container.scrollHeight - (container.scrollTop + container.clientHeight);
    return distance <= BOTTOM_THRESHOLD;
};

const scrollToLatest = () => {
    if (messageListRef.value) {
        messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
    }
};

const jumpToLatest = async () => {
    autoScrollEnabled.value = true;
    newMessagesAvailable.value = false;
    await nextTick();
    scrollToLatest();
};

const buildQueryOptions = (offset = 0) => {
    const options = {
        limit: PAGE_SIZE,
        offset
    };

    if (activeFilters.value.authorUsername) {
        options.authorUsername = activeFilters.value.authorUsername;
    }
    if (activeFilters.value.contentQuery) {
        options.contentQuery = activeFilters.value.contentQuery;
        options.matchType = activeFilters.value.matchType || 'substring';
    }

    return options;
};

const updateHasMore = (response, offset, fetchedLength) => {
    if (typeof response.hasMore === 'boolean') {
        hasMore.value = response.hasMore;
        return;
    }
    if (typeof response.total === 'number') {
        hasMore.value = offset + fetchedLength < response.total;
        return;
    }
    hasMore.value = fetchedLength === PAGE_SIZE;
};

async function loadInitialMessages() {
    if (!props.channelId) {
        messages.value = [];
        hasMore.value = true;
        newMessagesAvailable.value = false;
        autoScrollEnabled.value = true;
        return;
    }

    try {
        loading.value = true;
        error.value = null;
        const response = await getMessagesByChannel(props.channelId, buildQueryOptions(0));
        if (!response.success) {
            error.value = response.message;
            messages.value = [];
            return;
        }

        const normalized = normalizeMessages(response.data);
        messages.value = normalized;
        updateHasMore(response, 0, normalized.length);
        await nextTick();
        scrollToLatest();
    } catch (e) {
        error.value = 'Failed to fetch messages';
    } finally {
        loading.value = false;
    }
}

async function loadOlderMessages() {
    if (!props.channelId || !hasMore.value || loadingMore.value || loading.value) {
        return;
    }

    const offset = messages.value.length;
    const container = messageListRef.value;
    const previousHeight = container?.scrollHeight || 0;
    const previousScrollTop = container?.scrollTop || 0;
    autoScrollEnabled.value = false;

    try {
        loadingMore.value = true;
        error.value = null;
        const response = await getMessagesByChannel(props.channelId, buildQueryOptions(offset));

        if (!response.success) {
            error.value = response.message;
            return;
        }

        const normalized = normalizeMessages(response.data);
        if (normalized.length) {
            messages.value = [...normalized, ...messages.value];
            await nextTick();
            if (container) {
                const newHeight = container.scrollHeight;
                container.scrollTop = newHeight - previousHeight + previousScrollTop;
            }
        }

        updateHasMore(response, offset, normalized.length);
    } catch (e) {
        error.value = 'Failed to fetch messages';
    } finally {
        loadingMore.value = false;
    }
}

async function refreshLatestMessages() {
    if (!props.channelId) return;

    try {
        const response = await getMessagesByChannel(props.channelId, buildQueryOptions(0));

        if (!response.success) {
            error.value = response.message;
            return;
        }

        const normalized = normalizeMessages(response.data);
        const existingIds = new Set(messages.value.map((m) => m.id));
        const newOnes = normalized.filter((m) => !existingIds.has(m.id));

        if (newOnes.length) {
            messages.value = [...messages.value, ...newOnes];
            await nextTick();
            if (autoScrollEnabled.value) {
                scrollToLatest();
                newMessagesAvailable.value = false;
            } else {
                newMessagesAvailable.value = true;
            }
        }

        if (typeof response.total === 'number' && messages.value.length < response.total) {
            hasMore.value = true;
        }
    } catch (e) {
        error.value = 'Failed to fetch messages';
    }
}

const onScroll = () => {
    const container = messageListRef.value;
    if (!container) return;

    const currentTop = container.scrollTop;
    const scrollingUp = currentTop < lastScrollTop.value;
    if (scrollingUp) {
        autoScrollEnabled.value = false;
    }

    const nearBottom = isNearBottom(container);
    if (nearBottom) {
        autoScrollEnabled.value = true;
    }
    lastScrollTop.value = currentTop;

    if (autoScrollEnabled.value && newMessagesAvailable.value) {
        newMessagesAvailable.value = false;
        scrollToLatest();
    }

    if (loadingMore.value || !hasMore.value) return;
    if (container.scrollTop <= 10) {
        loadOlderMessages();
    }
};

const stopPolling = () => {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
};

const startPolling = () => {
    stopPolling();
    if (!props.channelId) return;
    pollingInterval = setInterval(refreshLatestMessages, POLL_INTERVAL_MS);
};

const applyFilters = () => {
    const term = searchTerm.value.trim();

    if (filterMode.value === 'author') {
        activeFilters.value = {
            authorUsername: term || null,
            contentQuery: null,
            matchType: 'substring'
        };
    } else {
        activeFilters.value = {
            authorUsername: null,
            contentQuery: term || null,
            matchType: matchType.value
        };
    }

    messages.value = [];
    hasMore.value = true;
    newMessagesAvailable.value = false;
    autoScrollEnabled.value = true;
    lastScrollTop.value = 0;
    loadInitialMessages();
};

const clearFilters = () => {
    searchTerm.value = '';
    filterMode.value = 'content';
    matchType.value = 'substring';
    activeFilters.value = {
        authorUsername: null,
        contentQuery: null,
        matchType: 'substring'
    };
    messages.value = [];
    hasMore.value = true;
    newMessagesAvailable.value = false;
    autoScrollEnabled.value = true;
    lastScrollTop.value = 0;
    loadInitialMessages();
};

watch(
    () => props.channelId,
    (channelId) => {
        stopPolling();
        messages.value = [];
        hasMore.value = true;
        newMessagesAvailable.value = false;
        autoScrollEnabled.value = true;
        lastScrollTop.value = 0;
        searchTerm.value = '';
        filterMode.value = 'content';
        matchType.value = 'substring';
        activeFilters.value = {
            authorUsername: null,
            contentQuery: null,
            matchType: 'substring'
        };
        if (!channelId) {
            return;
        }
        loadInitialMessages();
        startPolling();
    },
    { immediate: true }
);

onBeforeUnmount(stopPolling);

defineExpose({ fetchMessages: refreshLatestMessages, loadInitialMessages });
</script>

<template>
    <div class="message-list" ref="messageListRef" @scroll.passive="onScroll">
        <div class="message-filters">
            <input
                v-model="searchTerm"
                type="text"
                placeholder="Filtruj wiadomości"
                @keyup.enter="applyFilters"
            />
            <select v-model="filterMode">
                <option value="content">Treść</option>
                <option value="author">Użytkownik</option>
            </select>
            <select v-if="filterMode === 'content'" v-model="matchType">
                <option value="substring">Zawiera</option>
                <option value="prefix">Prefix</option>
                <option value="suffix">Sufix</option>
                <option value="exact">Dokładnie</option>
            </select>
            <button type="button" @click="applyFilters">Szukaj</button>
            <button
                v-if="activeFilters.contentQuery || activeFilters.authorUsername"
                type="button"
                class="clear-btn"
                @click="clearFilters"
            >
                Wyczyść
            </button>
        </div>
        <div
            v-if="newMessagesAvailable"
            class="new-messages-banner"
            @click="jumpToLatest"
        >
            New messages. Click to jump ↓
        </div>
        <div v-if="!channelId" class="placeholder">
            Select a channel to view messages
        </div>
        <div v-else-if="loading && messages.length === 0">Loading messages...</div>
        <div v-else-if="error && messages.length === 0" class="error">{{ error }}</div>
        <div v-else-if="messages.length === 0" class="placeholder">
            No messages in this channel yet
        </div>
        <div v-else class="messages">
            <div v-if="error" class="inline-error">{{ error }}</div>
            <div v-if="loadingMore" class="loading-more">Loading more messages...</div>
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
    position: relative;
    background: #fff;
}

.message-filters {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    flex-wrap: wrap;
    position: sticky;
    top: 0;
    background: #fff;
    padding: 6px 0;
    z-index: 2;
}

.message-filters input {
    flex: 1;
    min-width: 180px;
    padding: 6px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.message-filters select,
.message-filters button {
    padding: 6px 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
    background: #f9f9f9;
    cursor: pointer;
}

.message-filters button:hover {
    background: #f0f0f0;
}

.clear-btn {
    border-color: #e0e0e0;
    background: #fff;
    color: #444;
}

.clear-btn:hover {
    background: #f6f6f6;
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

.inline-error {
    color: #d14343;
    background: #fde8e8;
    border: 1px solid #f5c2c2;
    padding: 6px 8px;
    border-radius: 4px;
}

.loading-more {
    text-align: center;
    color: #888;
    font-size: 0.9em;
}

.new-messages-banner {
    position: sticky;
    top: 52px;
    margin: 0 auto 8px;
    background: #1e88e5;
    color: #fff;
    padding: 8px 14px;
    border-radius: 18px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 2;
    border: 1px solid rgba(255, 255, 255, 0.35);
    text-align: center;
    max-width: 240px;
}

.new-messages-banner:hover {
    background: #156cb6;
}
</style>
