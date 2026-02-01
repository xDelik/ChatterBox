<script setup>
import { ref, watch, defineProps, nextTick, onBeforeUnmount, computed } from 'vue';
import { getMessagesByChannel } from '../services/api.js';
import { getSocket, connectSocket } from '../services/socket.js';

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
const DEFAULT_PAGE_SIZE = 15;
const pageSize = ref(DEFAULT_PAGE_SIZE);
const BOTTOM_THRESHOLD = 5;
const socket = getSocket();
let activeChannelId = null;

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
        limit: pageSize.value,
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
    hasMore.value = fetchedLength === pageSize.value;
};

const formatTimestamp = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).replace(',', '');
};

const matchesActiveFilters = (message) => {
    const { authorUsername, contentQuery, matchType: activeMatchType } = activeFilters.value;

    if (authorUsername) {
        const author = message.author?.username || '';
        if (author.toLowerCase() !== authorUsername.toLowerCase()) {
            return false;
        }
    }

    if (contentQuery) {
        const haystack = (message.content || '').toLowerCase();
        const needle = contentQuery.toLowerCase();
        switch (activeMatchType) {
            case 'prefix':
                if (!haystack.startsWith(needle)) return false;
                break;
            case 'suffix':
                if (!haystack.endsWith(needle)) return false;
                break;
            case 'exact':
                if (haystack !== needle) return false;
                break;
            case 'substring':
            default:
                if (!haystack.includes(needle)) return false;
                break;
        }
    }

    return true;
};

const calculatePageSize = () => {
    const container = messageListRef.value;
    if (!container) {
        pageSize.value = DEFAULT_PAGE_SIZE;
        return;
    }

    const estimatedRowHeight = 24;
    const visibleRows = Math.max(1, Math.floor(container.clientHeight / estimatedRowHeight));
    pageSize.value = Math.max(DEFAULT_PAGE_SIZE, visibleRows * 2);
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
        try {
            await connectSocket();
        } catch (e) {
            error.value = e?.message || 'Socket connection failed';
            return;
        }

        const response = await new Promise((resolve) => {
            socket.emit(
                'messages:history',
                { channelId: props.channelId, ...buildQueryOptions(offset) },
                (payload) => resolve(payload)
            );
        });

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

const handleIncomingMessage = async (message) => {
    if (!message || `${message.channelId}` !== `${props.channelId}`) return;
    if (messages.value.some((m) => m.id === message.id)) return;
    if (!matchesActiveFilters(message)) return;

    messages.value = [...messages.value, message];
    await nextTick();
    if (autoScrollEnabled.value) {
        scrollToLatest();
        newMessagesAvailable.value = false;
    } else {
        newMessagesAvailable.value = true;
    }
};

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

const hasActiveFilters = computed(() => {
    return activeFilters.value.contentQuery || activeFilters.value.authorUsername;
});

watch(
    () => props.channelId,
    (channelId) => {
        if (activeChannelId) {
            socket.emit('leave-channel', { channelId: activeChannelId });
        }
        activeChannelId = null;
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
        activeChannelId = channelId;
        socket.emit('join-channel', { channelId });
        nextTick(() => {
            calculatePageSize();
            loadInitialMessages();
        });
    },
    { immediate: true }
);

socket.off('message:new', handleIncomingMessage);
socket.on('message:new', handleIncomingMessage);

const handleResize = () => {
    const previous = pageSize.value;
    calculatePageSize();
    if (props.channelId && pageSize.value !== previous) {
        loadInitialMessages();
    }
};

window.addEventListener('resize', handleResize);

onBeforeUnmount(() => {
    if (activeChannelId) {
        socket.emit('leave-channel', { channelId: activeChannelId });
    }
    socket.off('message:new', handleIncomingMessage);
    window.removeEventListener('resize', handleResize);
});

defineExpose({ loadInitialMessages });
</script>

<template>
    <div class="message-container">
        <div class="filter-bar">
            <span class="filter-prompt">grep:</span>
            <input
                v-model="searchTerm"
                type="text"
                placeholder="search pattern..."
                @keyup.enter="applyFilters"
            />
            <select v-model="filterMode">
                <option value="content">--content</option>
                <option value="author">--author</option>
            </select>
            <select v-if="filterMode === 'content'" v-model="matchType">
                <option value="substring">*match*</option>
                <option value="prefix">match*</option>
                <option value="suffix">*match</option>
                <option value="exact">=match</option>
            </select>
            <button type="button" @click="applyFilters">[EXEC]</button>
            <button
                v-if="hasActiveFilters"
                type="button"
                class="clear-btn"
                @click="clearFilters"
            >[CLR]</button>
        </div>

        <div class="message-list" ref="messageListRef" @scroll.passive="onScroll">
            <div
                v-if="newMessagesAvailable"
                class="new-messages-banner"
                @click="jumpToLatest"
            >
                [!] New messages available -- press to scroll down
            </div>

            <div v-if="!channelId" class="placeholder">
                <span class="prefix">[?]</span> Select a channel to view message log
            </div>
            <div v-else-if="loading && messages.length === 0" class="status-line">
                <span class="prefix">[*]</span> Loading messages...
            </div>
            <div v-else-if="error && messages.length === 0" class="status-line error">
                <span class="prefix">[!]</span> {{ error }}
            </div>
            <div v-else-if="messages.length === 0" class="placeholder">
                <span class="prefix">[-]</span> No messages in buffer
            </div>
            <div v-else class="messages">
                <div v-if="error" class="inline-error">
                    <span class="prefix">[!]</span> {{ error }}
                </div>
                <div v-if="loadingMore" class="loading-more">
                    <span class="prefix">[*]</span> Loading older messages...
                </div>
                <div
                    v-for="message in messages"
                    :key="message.id"
                    class="message"
                >
                    <span class="timestamp">[{{ formatTimestamp(message.createdAt) }}]</span>
                    <span class="author">&lt;{{ message.author?.username || 'unknown' }}&gt;</span>
                    <span class="content">{{ message.content }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.message-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.filter-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border-dim);
    background-color: var(--bg-tertiary);
    flex-wrap: wrap;
}

.filter-prompt {
    color: var(--accent);
    font-weight: 500;
}

.filter-bar input {
    flex: 1;
    min-width: 150px;
    padding: 4px 8px;
    background-color: var(--bg-primary);
    border: 1px solid var(--border-dim);
    color: var(--text-primary);
    font-family: inherit;
    font-size: inherit;
}

.filter-bar input:focus {
    outline: none;
    border-color: var(--text-primary);
    box-shadow: 0 0 5px var(--text-dim);
}

.filter-bar input::placeholder {
    color: var(--text-dim);
}

.filter-bar select {
    padding: 4px 8px;
    background-color: var(--bg-primary);
    border: 1px solid var(--border-dim);
    color: var(--text-secondary);
    font-family: inherit;
    font-size: inherit;
    cursor: pointer;
}

.filter-bar select:focus {
    outline: none;
    border-color: var(--text-primary);
}

.filter-bar button {
    padding: 4px 12px;
    background-color: var(--bg-primary);
    border: 1px solid var(--border-dim);
    color: var(--text-primary);
    font-family: inherit;
    font-size: inherit;
    cursor: pointer;
    transition: all 0.1s;
}

.filter-bar button:hover {
    background-color: var(--selection-bg);
    border-color: var(--text-primary);
}

.filter-bar .clear-btn {
    color: var(--warning);
    border-color: var(--warning);
}

.filter-bar .clear-btn:hover {
    background-color: rgba(255, 170, 0, 0.1);
}

.message-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px 12px;
    background-color: var(--bg-secondary);
}

.placeholder {
    color: var(--text-dim);
    padding: 20px;
}

.status-line {
    color: var(--text-secondary);
    padding: 8px 0;
}

.status-line.error {
    color: var(--error);
}

.prefix {
    color: var(--text-dim);
    margin-right: 8px;
}

.messages {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.message {
    padding: 2px 0;
    line-height: 1.5;
    word-break: break-word;
}

.timestamp {
    color: var(--text-dim);
    margin-right: 8px;
}

.author {
    color: var(--accent);
    margin-right: 8px;
    font-weight: 500;
}

.content {
    color: var(--text-primary);
}

.inline-error {
    color: var(--error);
    padding: 6px 0;
    border-bottom: 1px solid var(--border-dim);
    margin-bottom: 8px;
}

.loading-more {
    color: var(--text-secondary);
    padding: 6px 0;
    text-align: center;
}

.new-messages-banner {
    position: sticky;
    top: 0;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--accent);
    color: var(--accent);
    padding: 8px 12px;
    margin-bottom: 10px;
    cursor: pointer;
    text-align: center;
    transition: all 0.1s;
}

.new-messages-banner:hover {
    background-color: var(--selection-bg);
    color: var(--text-bright);
}
</style>
