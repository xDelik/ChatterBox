<script setup>
import { ref } from 'vue';
import UserList from './components/UserList.vue';
import UserForm from './components/UserForm.vue';
import ChannelList from './components/ChannelList.vue';
import ChannelForm from './components/ChannelForm.vue';
import MessageList from './components/MessageList.vue';
import MessageForm from './components/MessageForm.vue';

const selectedUser = ref(null);
const selectedChannel = ref(null);
const messageListRef = ref(null);
const userListRef = ref(null);
const channelListRef = ref(null);

function onUserSelected(user) {
    selectedUser.value = user;
}

function onChannelSelected(channel) {
    selectedChannel.value = channel;
}

function onMessageSent() {
    if (messageListRef.value) {
        messageListRef.value.fetchMessages();
    }
}

function onUserCreated() {
    if (userListRef.value) {
        userListRef.value.fetchUsers();
    }
}

function onChannelCreated() {
    if (channelListRef.value) {
        channelListRef.value.fetchChannels();
    }
}
</script>

<template>
    <div class="app">
        <header>
            <h1>ChatterBox</h1>
            <p v-if="selectedUser">Logged in as: <strong>{{ selectedUser.username }}</strong></p>
            <p v-else>Select a user to start chatting</p>
        </header>

        <main>
            <aside class="sidebar">
                <UserList ref="userListRef" @user-selected="onUserSelected" />
                <UserForm @user-created="onUserCreated" />

                <ChannelList ref="channelListRef" @channel-selected="onChannelSelected" />
                <ChannelForm
                    :current-user-id="selectedUser?.id"
                    @channel-created="onChannelCreated"
                />
            </aside>

            <section class="chat-area">
                <div class="channel-header" v-if="selectedChannel">
                    <h2># {{ selectedChannel.name }}</h2>
                    <p v-if="selectedChannel.description">{{ selectedChannel.description }}</p>
                </div>

                <MessageList
                    ref="messageListRef"
                    :channel-id="selectedChannel?.id"
                />

                <MessageForm
                    :channel-id="selectedChannel?.id"
                    :current-user-id="selectedUser?.id"
                    @message-sent="onMessageSent"
                />
            </section>
        </main>
    </div>
</template>

<style>
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

header {
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #eee;
}

header h1 {
    margin: 0 0 10px 0;
    color: #333;
}

header p {
    margin: 0;
    color: #666;
}

main {
    display: flex;
    gap: 20px;
}

.sidebar {
    width: 250px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.channel-header {
    padding: 10px;
    background-color: #f5f5f5;
    border-radius: 4px;
}

.channel-header h2 {
    margin: 0;
    color: #333;
}

.channel-header p {
    margin: 5px 0 0 0;
    color: #666;
    font-size: 0.9em;
}
</style>
