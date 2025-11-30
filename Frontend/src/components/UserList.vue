<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import { getUsers } from '../services/api.js';

const users = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedUserId = ref(null);

const emit = defineEmits(['user-selected']);

async function fetchUsers() {
    try {
        loading.value = true;
        const response = await getUsers();
        if (response.success) {
            users.value = response.data;
        } else {
            error.value = response.message;
        }
    } catch (e) {
        error.value = 'Failed to fetch users';
    } finally {
        loading.value = false;
    }
}

function selectUser(user) {
    selectedUserId.value = user.id;
    emit('user-selected', user);
}

onMounted(fetchUsers);

defineExpose({ fetchUsers });
</script>

<template>
    <div class="user-list">
        <h3>Users</h3>
        <div v-if="loading">Loading users...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <ul v-else>
            <li
                v-for="user in users"
                :key="user.id"
                :class="{ selected: selectedUserId === user.id }"
                @click="selectUser(user)"
            >
                <span class="status" :class="{ online: user.isOnline }"></span>
                {{ user.username }}
            </li>
        </ul>
    </div>
</template>

<style scoped>
.user-list {
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 4px;
}

.user-list h3 {
    margin-top: 0;
}

.user-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.user-list li {
    padding: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
}

.user-list li:hover {
    background-color: #f0f0f0;
}

.user-list li.selected {
    background-color: #e0e0ff;
}

.status {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #ccc;
}

.status.online {
    background-color: #4caf50;
}

.error {
    color: red;
}
</style>
