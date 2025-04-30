<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import MessageLayout from '@/components/layout/MessageLayout.vue'
import avatarImage from '/images/ava.png'
import { useDisplay } from 'vuetify'
import { useMessageStore } from '@/stores/messages'
import { useRoute } from 'vue-router'
import { useAuthUserStore } from '@/stores/authUser'

// Add emit declaration at the top of script
const emit = defineEmits(['toggle-navigation'])

const { mobile } = useDisplay()
const messageStore = useMessageStore()
const authStore = useAuthUserStore()
const route = useRoute()

const message = ref('')
const currentChatPartner = ref(null)

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
      return dateA - dateB
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
  emit('toggle-navigation', state)
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

  // Emit event to close drawer on mobile only
  if (mobile.value) {
    emit('toggle-navigation', false)
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

// Watch for new messages in the store to update the UI in real-time
watch(
  () => messageStore.messages,
  () => {
    // This will trigger reactivity in chatList and currentMessages computed properties
    // No need to do anything else as Vue will automatically update the UI
    console.log('Messages updated in store, refreshing UI')
  },
  { deep: true }, // Deep watch to detect changes in the array items
)

// Function to manually refresh messages
async function refreshMessages() {
  console.log('Manually refreshing messages')
  if (messageStore.refreshMessages) {
    await messageStore.refreshMessages()
  } else {
    await messageStore.fetchMessages()
  }
}

onUnmounted(() => {
  // Clean up real-time subscription when leaving the view
  messageStore.cleanup()
})
</script>

<template>
  <MessageLayout @toggle-navigation="handleToggleNavigation">
    <!-- Chat list for drawer -->
    <template #drawer-content>
      <v-list class="messenger-chat-list pa-0">
        <v-list-item class="d-flex justify-space-between pa-4 messenger-header">
          <h2 class="text-h6 font-weight-bold">Chats</h2>
          <v-btn icon variant="text" @click="refreshMessages" :loading="messageStore.isLoading">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </v-list-item>

        <v-divider></v-divider>

        <div v-if="chatList.length === 0" class="pa-4 text-center">No conversations yet</div>

        <v-list-item
          v-for="(chat, index) in chatList"
          :key="index"
          class="messenger-chat-item py-3 px-2"
          @click="selectChatPartner(chat)"
          :class="{
            'messenger-active-chat': currentChatPartner && currentChatPartner.id === chat.id,
          }"
        >
          <div class="d-flex align-center w-100">
            <v-avatar size="40" class="mr-3">
              <v-img src="/MotoGo/images/ava.png" alt="Avatar" />
            </v-avatar>
            <div class="messenger-chat-info flex-grow-1">
              <div class="d-flex justify-space-between align-center">
                <div class="messenger-chat-name font-weight-medium">
                  {{ chat.id === currentUserId ? 'Me' : 'Partner' }}
                </div>
                <div class="messenger-time text-caption">
                  {{ formatTime(chat.timestamp) }}
                </div>
              </div>
              <div class="messenger-preview text-caption text-truncate">
                {{ chat.lastMessage || '\u00A0' }}
              </div>
            </div>
          </div>
        </v-list-item>
      </v-list>
    </template>

    <template #content>
      <div class="messenger-layout">
        <!-- CHAT AREA -->
        <div class="messenger-content" style="position: relative">
          <template v-if="currentChatPartner">
            <!-- CHAT HEADER -->
            <div class="messenger-chat-header" style="position: fixed; top: 55px; z-index: 2">
              <div class="d-flex align-center justify-space-between w-100">
                <div class="d-flex align-center">
                  <v-avatar size="40" class="mr-3">
                    <v-img src="/MotoGo/images/ava.png" alt="Avatar" />
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">
                      {{ currentChatPartner.id === currentUserId ? 'Me' : 'Partner' }}
                    </div>
                    <div class="text-caption text-grey">
                      {{
                        messageStore.typingUsers && messageStore.typingUsers[currentChatPartner.id]
                          ? 'Typing...'
                          : 'Online'
                      }}
                    </div>
                  </div>
                </div>
                <v-btn
                  icon
                  variant="text"
                  @click="refreshMessages"
                  :loading="messageStore.isLoading"
                >
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </div>
            </div>

            <!-- MESSAGE DISPLAY AREA -->
            <div
              class="messenger-messages-container"
              style="
                flex: 1;
                padding: 16px;
                padding-top: 70px;
                padding-bottom: 50px;
                overflow-y: auto;
                background-color: #f0f2f5;
                display: flex;
                flex-direction: column;
                height: calc(100vh - 130px);
              "
            >
              <div v-if="!currentMessages.length" class="messenger-no-messages">
                <v-icon size="64" color="grey-lighten-2" class="mb-4"
                  >mdi-message-text-outline</v-icon
                >
                <div>No messages yet. Send a message to start the conversation!</div>
              </div>

              <div v-else class="messenger-messages-list">
                <div
                  v-for="(msg, index) in currentMessages"
                  :key="index"
                  class="messenger-message-wrapper"
                  :class="[msg.from === 'me' ? 'messenger-outgoing' : 'messenger-incoming']"
                  @click="markMessageAsRead(msg.id)"
                >
                  <div class="messenger-bubble">
                    {{ msg.text }}
                  </div>
                  <div class="messenger-timestamp text-caption">
                    {{ formatTime(msg.timestamp) }}
                  </div>
                </div>

                <!-- Typing indicator for the current chat partner -->
                <div
                  v-if="messageStore.typingUsers && messageStore.typingUsers[currentChatPartner.id]"
                  class="messenger-message-wrapper messenger-incoming"
                >
                  <div class="messenger-bubble messenger-typing">
                    <div class="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- INPUT FIELD -->
            <div class="messenger-input-container" style="position: fixed; bottom: 0; z-index: 2">
              <v-textarea
                v-model="message"
                :rows="1"
                auto-grow
                hide-details
                variant="outlined"
                density="comfortable"
                placeholder="Type a message..."
                class="messenger-input"
                @keydown="handleTyping"
                @keyup.enter.prevent="sendMessage"
              ></v-textarea>
              <v-btn
                color="primary"
                icon
                class="messenger-send-btn"
                :disabled="!message.trim()"
                @click="sendMessage"
              >
                <v-icon>mdi-send</v-icon>
              </v-btn>
            </div>
          </template>
          <template v-else>
            <div class="messenger-empty-state">
              <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-chat-outline</v-icon>
              <div class="text-h6 font-weight-medium mb-2">Your Messages</div>
              <div class="text-body-2 text-center px-4">
                Select a conversation from the list or start a new one
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>
  </MessageLayout>
</template>

<style scoped>
/* Facebook Messenger Style Layout */
.messenger-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: #f0f2f5;
}

/* Chat List Styling */
.messenger-chat-list {
  background-color: white;
}

.messenger-header {
  border-bottom: 1px solid #e4e6eb;
}

.messenger-chat-item {
  border-radius: 8px;
  margin: 0 4px;
  transition: background-color 0.2s;
}

.messenger-chat-item:hover {
  background-color: #f2f2f2;
}

.messenger-active-chat {
  background-color: #e7f3ff !important;
}

.messenger-chat-name {
  font-size: 15px;
  color: #050505;
}

.messenger-preview {
  color: #65676b;
  max-width: 160px;
}

.messenger-time {
  color: #65676b;
  font-size: 12px;
}

/* Chat Content Area */
.messenger-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.messenger-chat-header {
  padding: 12px 16px;
  background-color: white;
  border-bottom: 1px solid #e4e6eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  z-index: 2;
  position: sticky;
  top: 0;
  width: 100%;
}

.messenger-messages-container {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 130px);
}

.messenger-no-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #65676b;
  text-align: center;
  padding: 20px;
}

.messenger-messages-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.messenger-message-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  margin-bottom: 8px;
}

.messenger-incoming {
  align-self: flex-start;
}

.messenger-outgoing {
  align-self: flex-end;
}

.messenger-bubble {
  padding: 8px 12px;
  border-radius: 18px;
  word-break: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.messenger-incoming .messenger-bubble {
  background-color: white;
  color: #050505;
  border-top-left-radius: 4px;
}

.messenger-outgoing .messenger-bubble {
  background-color: #0084ff;
  color: white;
  border-top-right-radius: 4px;
}

.messenger-timestamp {
  margin-top: 2px;
  font-size: 11px;
  color: #65676b;
  align-self: flex-end;
}

.messenger-incoming .messenger-timestamp {
  align-self: flex-start;
  margin-left: 4px;
}

.messenger-outgoing .messenger-timestamp {
  align-self: flex-end;
  margin-right: 4px;
}

.messenger-typing {
  padding: 10px 12px;
}

.typing-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #bcc0c4;
  animation: typingAnimation 1.4s infinite ease-in-out;
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

@keyframes typingAnimation {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

.messenger-input-container {
  display: flex;
  align-items: flex-end;
  padding: 12px 16px;
  background-color: white;
  border-top: 1px solid #e4e6eb;
  position: sticky;
  bottom: 0;
  z-index: 2;
  width: 100%;
}

.messenger-input {
  flex: 1;
  border-radius: 20px;
  font-size: 15px;
  max-height: 120px;
}

.messenger-send-btn {
  margin-left: 8px;
}

.messenger-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #65676b;
  text-align: center;
  padding: 20px;
  background-color: #f0f2f5;
}

/* Mobile Responsive Adjustments */
@media (max-width: 600px) {
  .messenger-message-wrapper {
    max-width: 85%;
  }
}
</style>
