<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import MessageLayout from '@/components/layout/MessageLayout.vue'
import avatarImage from '/images/ava.png'
import { useDisplay } from 'vuetify'
import { useMessageStore } from '@/stores/messages'
import { useRoute } from 'vue-router'
import { useAuthUserStore } from '@/stores/authUser'

const { mobile } = useDisplay()
const messageStore = useMessageStore()
const authStore = useAuthUserStore()
const route = useRoute()

const message = ref('')
const currentChatPartner = ref(null)
const drawer = ref(false)

// Get current user ID, fallback to Supabase if not present in authStore
import { supabase } from '@/utils/supabase'
const currentUserId = computed(() => {
  if (authStore.userData?.id) return authStore.userData.id
  // Fallback: try to get from Supabase session
  try {
    const session = supabase.auth.session && supabase.auth.session()
    return session?.user?.id || null
  } catch (err) {
    console.warn('Could not get user ID from Supabase:', err)
    return null
  }
})

// Define chatList computed property
const chatList = computed(() => {
  const chats = {}
  if (messageStore.messages.length) {
    messageStore.messages.forEach((msg) => {
      // Determine who the other person in the conversation is
      const partnerId = msg.rider_id === currentUserId.value ? msg.passenger_id : msg.rider_id
      // Do not add self as chat partner
      if (!partnerId || partnerId === currentUserId.value) {
        return
      }

      // Get the partner's name and image (default values)

      // Create or update chat entry
      if (!chats[partnerId]) {
        chats[partnerId] = {
          id: partnerId,
          lastMessage: msg.content,
          timestamp: msg.created_at || new Date().toISOString(),
        }
      } else if (
        msg.created_at &&
        new Date(msg.created_at) > new Date(chats[partnerId].timestamp)
      ) {
        // Update last message if this one is newer (assuming created_at exists)
        chats[partnerId].lastMessage = msg.content
        chats[partnerId].timestamp = msg.created_at
      }
    })
  }

  // Convert to array and sort by newest message
  return Object.values(chats).sort((a, b) => {
    const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0)
    const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0)
    return dateB - dateA
  })
})

const currentMessages = computed(() => {
  if (!currentChatPartner.value) return []

  return messageStore.messages
    .filter(
      (msg) =>
        (msg.rider_id == currentUserId.value && msg.passenger_id == currentChatPartner.value.id) ||
        (msg.passenger_id == currentUserId.value && msg.rider_id == currentChatPartner.value.id),
    )
    .sort((a, b) => {
      // Handle missing created_at fields
      const dateA = a.created_at ? new Date(a.created_at) : new Date(0)
      const dateB = b.created_at ? new Date(b.created_at) : new Date(0)
      return dateB - dateA
    })
    .map((msg) => ({
      ...msg,
      text: msg.content,
      from: msg.rider_id == currentUserId.value ? 'me' : 'them',
      timestamp: msg.created_at || new Date().toISOString(),
    }))
})

// Function to start a new chat
async function newChat(userId) {
  if (!userId) return

  // Create a new chat partner
  const partner = {
    id: userId,
    timestamp: new Date().toISOString(),
  }

  // Set as current chat partner
  selectChatPartner(partner)

  // Send a welcome message
  await sendMessage({
    content: 'Hi! Starting a new conversation.',
    passenger_id: userId,
  })
}

watch(
  [() => route.params.id, chatList],
  async ([chatId, chats]) => {
    if (chatId) {
      let partner = chats.find((chat) => chat.id == chatId)
      if (!partner) {
        // If no existing chat, create a new one
        await newChat(chatId)
      } else {
        selectChatPartner(partner)
      }
    }
  },
  { immediate: true },
)

// Send a message
async function sendMessage() {
  if (message.value.trim() === '' || !currentChatPartner.value) return

  await messageStore.sendMessage({
    passenger_id: currentChatPartner.value.id,
    content: message.value,
  })

  message.value = ''

  // Clear typing indicator
  messageStore.setTypingIndicator(currentChatPartner.value.id, false)
}

function handleToggleNavigation(state) {
  drawer.value = state
}

// Format timestamp for display
function formatTime(timestamp) {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  const now = new Date()

  // If the message is from today, show only the time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // If the message is from this week, show the day name
  const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  if (daysDiff < 7) {
    return date.toLocaleDateString([], { weekday: 'short' })
  }

  // Otherwise show the date
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

// Select a chat partner
function selectChatPartner(partner) {
  if (!partner) {
    console.warn('No chat partner provided to selectChatPartner')
    return
  }
  currentChatPartner.value = partner
  console.log('DEBUG: Selected partner:', partner)
  if (mobile.value) {
    drawer.value = false
  }

  // Mark messages as read in the UI (since we don't have a database field for this)
  if (messageStore.unreadMessages && messageStore.unreadMessages[partner.id]) {
    messageStore.unreadMessages[partner.id].forEach((messageId) => {
      if (typeof messageStore.markMessageAsRead === 'function') {
        messageStore.markMessageAsRead(messageId)
      }
    })
  }
}

// Mark a message as read
function markMessageAsRead(messageId) {
  if (messageId && typeof messageStore.markMessageAsRead === 'function') {
    messageStore.markMessageAsRead(messageId)
  }
}

// Handle typing indicator
let typingTimeout
function handleTyping() {
  if (!currentChatPartner.value) return

  // Set typing indicator
  messageStore.setTypingIndicator(currentChatPartner.value.id, true)

  // Clear previous timeout
  clearTimeout(typingTimeout)

  // Set new timeout to clear typing indicator after 1 second of inactivity
  typingTimeout = setTimeout(() => {
    if (currentChatPartner.value) {
      messageStore.setTypingIndicator(currentChatPartner.value.id, false)
    }
  }, 1000)
}

onMounted(async () => {
  // Ensure user is authenticated and userData is loaded
  await authStore.isAuthenticated()
})

// Watch for currentUserId to be set, then fetch messages and auto-select chat
watch(
  () => currentUserId.value,
  async (userId) => {
    if (userId) {
      await messageStore.fetchMessages()
      if (chatList.value.length > 0 && !currentChatPartner.value) {
        selectChatPartner(chatList.value[0])
      }
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  // Clean up real-time subscription when leaving the view
  messageStore.cleanup()
})
</script>

<template>
  <MessageLayout @toggle-navigation="handleToggleNavigation">
    <template #content>
      <div class="chat-layout">
        <!-- TOP HEADER -->
        <div class="app-header">
          <router-link to="/system/passenger-dashboard" class="back-link">
            <v-icon>mdi-arrow-left</v-icon> BACK TO DASHBOARD
          </router-link>
          <div class="page-title">Messages</div>
        </div>

        <div class="main-container">
          <!-- SIDEBAR -->
          <div class="sidebar-container" v-if="mobile ? drawer : true">
            <div class="sidebar-header">
              <div class="d-flex align-center">
                <h2 class="text-h6 font-weight-medium">Chats</h2>
              </div>
            </div>

            <div v-if="messageStore.isLoading" class="pa-4 text-center">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>

            <div v-else-if="chatList.length === 0" class="pa-4 text-center">
              <p>No conversations yet</p>
            </div>

            <div
              v-for="chat in chatList"
              :key="chat.id"
              class="chat-list-item"
              :class="{ 'selected-chat': currentChatPartner && currentChatPartner.id === chat.id }"
              @click="selectChatPartner(chat)"
            >
              <div class="chat-avatar">
                <img :src="chat.ava" alt="Avatar" class="avatar-img" />
              </div>
              <div class="chat-info">
                <div class="chat-name">{{ chat.id === currentUserId ? 'Me' : 'Partner' }}</div>
                <div class="chat-preview">{{ chat.lastMessage }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Navigation Drawer -->
        <v-navigation-drawer v-if="mobile" v-model="drawer" :location="'left'" :width="300">
          <v-list>
            <v-list-item class="d-flex justify-space-between pa-4">
              <h2 class="text-h6">Chats</h2>
              <v-btn icon @click="drawer = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-list-item>

            <v-divider></v-divider>

            <div v-if="chatList.length === 0" class="pa-4 text-center">No conversations yet</div>

            <v-list-item
              v-for="(chat, index) in chatList"
              :key="index"
              class="chat-list-item-mobile"
              @click="selectChatPartner(chat)"
              :class="{
                'bg-purple-lighten-5': currentChatPartner && currentChatPartner.id === chat.id,
              }"
            >
              <div class="d-flex align-center w-100">
                <div class="chat-avatar">
                  <img src="/images/ava.png" alt="Avatar" class="avatar-img" />
                </div>
                <div class="chat-info">
                  <div class="chat-name">
                    {{ chat.id === currentUserId ? 'Me' : 'Partner' }}
                  </div>
                  <div class="chat-preview">{{ chat.lastMessage || '\u00A0' }}</div>
                </div>
              </div>
            </v-list-item>
          </v-list>
        </v-navigation-drawer>

        <!-- CHAT AREA -->
        <div class="chat-content">
          <template v-if="currentChatPartner">
            <!-- CHAT HEADER -->
            <div class="chat-header">
              <div class="d-flex align-center">
                <v-btn v-if="mobile" icon class="mr-2" @click="drawer = true">
                  <v-icon>mdi-menu</v-icon>
                </v-btn>
                <img src="/images/ava.png" alt="Avatar" class="chat-header-avatar" />
                <div class="chat-header-info">
                  <div class="chat-header-name">
                    {{ currentChatPartner.id === currentUserId ? 'Me' : 'Partner' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- MESSAGE DISPLAY AREA -->
            <div class="messages-container">
              <div v-if="!currentMessages.length" class="no-messages">
                No messages yet. Send a message to start the conversation!
              </div>

              <div
                v-for="(msg, index) in currentMessages"
                :key="index"
                :class="[
                  'message-bubble',
                  msg.from === 'me' ? 'message-outgoing' : 'message-incoming',
                ]"
                @click="markMessageAsRead(msg.id)"
              >
                {{ msg.text }}
                <div class="message-timestamp">
                  {{ formatTime(msg.timestamp) }}
                </div>
              </div>

              <!-- Typing indicator for the current chat partner -->
              <div
                v-if="messageStore.typingUsers && messageStore.typingUsers[currentChatPartner.id]"
                class="message-bubble message-incoming typing-container"
              >
                <div class="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>

            <!-- INPUT FIELD -->
            <div class="message-input-container">
              <v-textarea
                v-model="message"
                :rows="1"
                auto-grow
                placeholder="Type a message..."
                @keydown="handleTyping"
                @keyup.enter.prevent="sendMessage"
              ></v-textarea>
              <v-btn color="primary" :disabled="!message.trim()" @click="sendMessage"> Send </v-btn>
            </div>
          </template>
          <template v-else>
            <div class="empty-state">
              <div class="empty-text">Select a conversation to start chatting</div>
            </div>
          </template>
        </div>
      </div>
    </template>
  </MessageLayout>
</template>

<style scoped>
/* Overall Layout */
.chat-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
}

.app-header {
  background-color: #7c3aed;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  height: 60px;
}

.back-link {
  display: flex;
  align-items: center;
  color: white;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.page-title {
  font-size: 18px;
  font-weight: 500;
}

.main-container {
  display: flex;
  height: calc(100vh - 60px);
  overflow: hidden;
}

/* Sidebar Styles */
.sidebar-container {
  width: 320px;
  background-color: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-header {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.chat-list-item {
  display: flex;
  padding: 15px;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  transition: background-color 0.2s;
}

.chat-list-item:hover {
  background-color: #f9f9f9;
}

.chat-list-item.selected-chat {
  background-color: #f0e6ff;
}

.chat-list-item-mobile {
  padding: 10px 15px;
  cursor: pointer;
}

.chat-avatar {
  margin-right: 15px;
}

.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-info {
  flex: 1;
  overflow: hidden;
}

.chat-name {
  font-weight: 500;
  margin-bottom: 3px;
}

.chat-preview {
  color: #757575;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Chat Content Styles */
.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  overflow: hidden;
}

.chat-header {
  background-color: #7c3aed;
  color: white;
  padding: 10px 20px;
  display: flex;
  align-items: center;
}

.chat-header-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 10px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.chat-header-name {
  font-weight: 500;
  font-size: 16px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.no-messages {
  text-align: center;
  color: #757575;
  margin-top: 40px;
}

.message-bubble {
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 18px;
  margin-bottom: 8px;
  position: relative;
}

.message-incoming {
  background-color: white;
  color: #333;
  align-self: flex-start;
  margin-right: auto;
  border-bottom-left-radius: 5px;
}

.message-outgoing {
  background-color: #7c3aed;
  color: white;
  align-self: flex-end;
  margin-left: auto;
  border-bottom-right-radius: 5px;
}

.message-timestamp {
  font-size: 11px;
  margin-top: 3px;
  opacity: 0.8;
  text-align: right;
}

.message-input-container {
  padding: 15px;
  background-color: white;
  border-top: 1px solid #e0e0e0;
}

.message-input {
  width: 100%;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.empty-text {
  color: #757575;
  font-size: 16px;
}

/* Typing indicators */
.typing-container {
  max-width: 70px;
  padding: 10px;
}

.typing-dots {
  display: flex;
  align-items: center;
  justify-content: center;
}

.typing-dots span {
  height: 8px;
  width: 8px;
  margin: 0 2px;
  background-color: #9e9e9e;
  border-radius: 50%;
  display: inline-block;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-dots span:nth-child(1) {
  animation-delay: 0s;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.6;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
