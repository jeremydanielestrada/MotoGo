<script setup>
import { ref, onMounted, computed } from 'vue'
import MessageLayout from '@/components/layout/MessageLayout.vue'
import avatarImage from '/images/ava.png'
import { useDisplay } from 'vuetify'
import { useMessageStore } from '@/stores/message'
import { useRoute } from 'vue-router'
import { useAuthUserStore } from '@/stores/authUser'

const { mobile } = useDisplay()
const messageStore = useMessageStore()
const authStore = useAuthUserStore()
const route = useRoute()

const message = ref('')
const messages = ref([])
const currentChatPartner = ref(null)
const iconIndex = ref(0)
const hideDisplay = ref(false)
const drawer = ref(false)

// Get current user ID
const currentUserId = computed(() => authStore.userData?.id)

// Get all chats (grouped conversations)
const chatList = computed(() => {
  // Group messages by conversation partner
  const chats = {}

  if (messageStore.messages.length) {
    messageStore.messages.forEach((msg) => {
      // Determine who the other person in the conversation is
      const partnerId = msg.rider_id === currentUserId.value ? msg.passenger_id : msg.rider_id
      const isRider = msg.rider_id !== currentUserId.value

      // Get the partner's name and image
      const partnerName = isRider ? msg.rider_name : msg.passenger_name

      // Determine the profile image - use actual image URL if available, fallback to default
      const profileImage = isRider
        ? msg.rider_image_url || avatarImage
        : msg.passenger_image_url || avatarImage

      if (!chats[partnerId]) {
        chats[partnerId] = {
          id: partnerId,
          name: partnerName || (isRider ? 'Rider' : 'Passenger'),
          lastMessage: msg.content,
          ava: profileImage,
          timestamp: msg.created_at,
        }
      } else if (new Date(msg.created_at) > new Date(chats[partnerId].timestamp)) {
        // Update last message if this one is newer
        chats[partnerId].lastMessage = msg.content
        chats[partnerId].timestamp = msg.created_at
      }
    })
  }

  // Convert to array and sort by newest message
  return Object.values(chats).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
})

// Get messages for the current conversation
const currentMessages = computed(() => {
  if (!currentChatPartner.value) return []

  return messageStore.messages
    .filter(
      (msg) =>
        (msg.rider_id === currentUserId.value &&
          msg.passenger_id === currentChatPartner.value.id) ||
        (msg.passenger_id === currentUserId.value && msg.rider_id === currentChatPartner.value.id),
    )
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((msg) => ({
      text: msg.content,
      from: msg.rider_id === currentUserId.value ? 'me' : 'them',
      timestamp: msg.created_at,
      ava: avatarImage,
    }))
})

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

function clearMessage() {
  message.value = ''
}

function resetIcon() {
  iconIndex.value = 0
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
  currentChatPartner.value = partner
  if (mobile.value) {
    drawer.value = false
  }
  
  // Mark messages from this partner as read
  if (messageStore.unreadMessages[partner.id]) {
    messageStore.unreadMessages[partner.id].forEach(messageId => {
      messageStore.markMessageAsRead(messageId)
    })
  }
}

// Mark a message as read
function markMessageAsRead(messageId) {
  if (messageId) {
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

// Get message status icon
function getStatusIcon(messageId) {
  const status = messageStore.messageStatus[messageId]
  switch (status) {
    case 'sent': return 'mdi-check'
    case 'delivered': return 'mdi-check-all'
    case 'read': return 'mdi-check-all'
    default: return 'mdi-clock-outline'
  }
}

// Get message status color
function getStatusColor(messageId) {
  const status = messageStore.messageStatus[messageId]
  return status === 'read' ? 'light-blue' : 'grey-lighten-1'
}

onMounted(async () => {
  // Load messages on component mount
  await authStore.isAuthenticated()
  await messageStore.fetchMessages()

  // If there's a chat ID in the route, select that chat
  const chatId = route.params.id
  if (chatId) {
    const partner = chatList.value.find((chat) => chat.id === chatId)
    if (partner) {
      selectChatPartner(partner)
    }
  } else if (chatList.value.length > 0) {
    // Otherwise select the first chat
    selectChatPartner(chatList.value[0])
  }
})
</script>

<template>
  <MessageLayout @toggle-navigation="handleToggleNavigation">
    <template #content>
      <v-row
        class="d-flex"
        style="
          position: fixed;
          top: 60px;
          left: 0;
          width: 100%;
          height: calc(100vh - 60px);
          overflow: hidden;
          margin: 0;
          padding: 0;
        "
      >
        <!-- SIDEBAR -->
        <v-col
          cols="12"
          md="3"
          class="d-flex flex-column bg-light"
          style="border-right: 1px solid #ddd; overflow-y: auto; padding: 0"
          v-if="mobile ? hideDisplay : !hideDisplay"
        >
          <v-card flat class="py-4 px-3" elevation="0">
            <v-row>
              <v-col cols="12" class="d-flex align-center">
                <router-link to="/system/passenger-dashboard">
                  <v-icon size="30" class="mr-2">mdi-keyboard-backspace</v-icon>
                </router-link>
                <h2 class="text-h6 font-weight-bold mb-0">Chats</h2>
              </v-col>
            </v-row>
          </v-card>
          <v-divider></v-divider>

          <div v-if="messageStore.isLoading" class="pa-4 text-center">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </div>

          <div v-else-if="chatList.length === 0" class="pa-4 text-center">
            <p>No conversations yet</p>
          </div>

          <v-card
            flat
            class="py-3 mt-3 mx-3 cursor-pointer"
            elevation="0"
            v-for="chat in chatList"
            :key="chat.id"
            style="border: 1px solid #ddd; border-radius: 8px"
            :class="{
              'bg-purple-lighten-5': currentChatPartner && currentChatPartner.id === chat.id,
            }"
            @click="selectChatPartner(chat)"
          >
            <div class="d-flex align-center">
              <img :src="chat.ava" alt="Avatar" width="50" class="avatar-img mr-3" />
              <div class="title-container">
                <v-card-title class="text-h6 mb-1">{{ chat.name }}</v-card-title>
                <v-card-subtitle class="text-subtitle-2 text-truncate">
                  {{ chat.lastMessage }}
                </v-card-subtitle>
              </div>
            </div>
          </v-card>
        </v-col>

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

            <v-list-item v-if="chatList.length === 0" class="pa-4 text-center">
              No conversations yet
            </v-list-item>

            <v-list-item
              v-for="(chat, index) in chatList"
              :key="index"
              class="pa-2 cursor-pointer"
              @click="selectChatPartner(chat)"
              :class="{
                'bg-purple-lighten-5': currentChatPartner && currentChatPartner.id === chat.id
              }"
            >
              <div class="d-flex align-center w-100">
                <!-- Contact Avatar -->
                <div class="position-relative">
                  <v-avatar size="40" class="mr-3">
                    <v-img
                      :src="chat.ava"
                      :alt="chat.name"
                      class="rounded-circle"
                      cover
                    >
                      <template v-slot:placeholder>
                        <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                          {{ chat.name.charAt(0).toUpperCase() }}
                        </div>
                      </template>
                    </v-img>
                  </v-avatar>
                  
                  <!-- Online indicator -->
                  <div v-if="messageStore.typingUsers[chat.id]" class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                
                <!-- Contact Info -->
                <div class="title-container flex-grow-1">
                  <div class="d-flex justify-space-between align-center">
                    <div class="d-flex align-center">
                      <div class="text-subtitle-1 font-weight-medium text-truncate">{{ chat.name }}</div>
                      <!-- Unread message badge -->
                      <v-badge 
                        v-if="messageStore.unreadMessages[chat.id] && messageStore.unreadMessages[chat.id].length > 0"
                        :content="messageStore.unreadMessages[chat.id].length"
                        color="error"
                        class="ml-2"
                      ></v-badge>
                    </div>
                    <div class="text-caption text-grey" v-if="chat.timestamp">
                      {{ formatTime(chat.timestamp) }}
                    </div>
                  </div>
                  <div class="d-flex align-center">
                    <div class="text-caption text-truncate" style="max-width: 180px">
                      {{ messageStore.typingUsers[chat.id] ? 'Typing...' : chat.lastMessage }}
                    </div>
                  </div>
                </div>
              </div>
            </v-list-item>
          </v-list>
        </v-navigation-drawer>

        <!-- CHAT AREA -->
        <v-col cols="12" md="9" class="d-flex flex-column" style="padding: 0; margin: 0">
          <!-- HEADER -->
          <v-card
            flat
            class="d-flex align-center py-3"
            elevation="0"
            style="border-bottom: 1px solid #ddd; margin: 0"
            v-if="currentChatPartner"
          >
            <img :src="currentChatPartner.ava" alt="Avatar" width="50" class="avatar-img mr-3" />
            <div class="title-container">
              <v-card-title class="text-h6 mb-1">{{ currentChatPartner.name }}</v-card-title>
              <v-card-subtitle class="text-subtitle-2">Last seen recently</v-card-subtitle>
            </div>
            <v-spacer></v-spacer>
            <v-icon size="24" class="me-3">mdi-phone-outline</v-icon>
          </v-card>

          <v-divider></v-divider>

          <!-- MESSAGE DISPLAY AREA -->
          <div
            class="flex-grow-1 px-4 py-3 message-container"
            style="background-color: #f5f5f5; margin: 0; overflow-y: auto"
          >
            <div v-if="!currentChatPartner" class="text-center my-4">
              <p>Select a conversation to start chatting</p>
            </div>

            <div v-else-if="currentMessages.length === 0" class="text-center my-4">
              <p>No messages yet. Send a message to start the conversation!</p>
            </div>

            <div
              v-for="(msg, index) in currentMessages"
              :key="index"
              :class="[
                'message-bubble my-2 pa-3 rounded-lg',
                msg.from === 'me'
                  ? 'align-self-end ms-auto bg-purple-darken-4 text-white'
                  : 'align-self-start bg-white text-black',
              ]"
              style="max-width: 70%"
              @click="markMessageAsRead(msg.id)"
            >
              {{ msg.text }}
              <div class="d-flex justify-space-between align-center message-footer">
                <div class="message-status" v-if="msg.from === 'me'">
                  <v-icon 
                    size="x-small" 
                    :color="getStatusColor(msg.id)"
                    class="mr-1"
                  >
                    {{ getStatusIcon(msg.id) }}
                  </v-icon>
                </div>
                <div class="message-time text-caption" :class="{ 'ms-auto': msg.from === 'me' }">
                  {{
                    new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  }}
                </div>
              </div>
            </div>
            
            <!-- Typing indicator for the current chat partner -->
            <div 
              v-if="currentChatPartner && messageStore.typingUsers[currentChatPartner.id]"
              class="message-bubble my-2 pa-3 rounded-lg align-self-start bg-white text-black typing-container"
            >
              <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>

          <!-- INPUT FIELD -->
          <v-sheet
            class="d-flex align-center px-4 py-3 mb-0"
            elevation="2"
            style="background-color: white; margin: 0; padding: 0"
            v-if="currentChatPartner"
          >
            <v-text-field
              v-model="message"
              :append-icon="message ? 'mdi-send' : 'mdi-microphone'"
              placeholder="Type a message"
              type="text"
              variant="outlined"
              density="compact"
              rounded="pill"
              class="flex-grow-1"
              @keyup.enter="sendMessage"
              @click:append="sendMessage"
              @input="handleTyping"
            />
          </v-sheet>
        </v-col>
      </v-row>
    </template>
  </MessageLayout>
</template>

<style scoped>
.avatar-img {
  border-radius: 100%;
  padding: 5px;
}

.title-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.title-container .v-card-title {
  margin-bottom: 0;
  line-height: 1.2;
}

.title-container .v-card-subtitle {
  margin-top: -5px;
  font-size: 0.9rem;
  color: gray;
}

.message-container {
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.message-bubble {
  position: relative;
  display: inline-block;
  margin-bottom: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-time {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
}

.message-bubble.bg-white .message-time {
  color: rgba(0, 0, 0, 0.5);
}

.message-footer {
  margin-top: 4px;
  width: 100%;
}

.message-status {
  display: flex;
  align-items: center;
}

/* Typing indicators */
.position-relative {
  position: relative;
}

.typing-indicator {
  position: absolute;
  bottom: -2px;
  right: 0;
  background-color: #4CAF50;
  border-radius: 50%;
  width: 12px;
  height: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid white;
}

.typing-container {
  padding: 10px 16px;
  max-width: 100px;
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
  background-color: #9E9E9E;
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
  0%, 80%, 100% { 
    transform: scale(0.6);
    opacity: 0.6;
  }
  40% { 
    transform: scale(1);
    opacity: 1;
  }
}
</style>
