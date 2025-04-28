<script setup>
import { ref, onMounted, computed } from 'vue'
import MessageLayout from '@/components/layout/MessageLayout.vue'
import MessageNavigation from '@/components/layout/navigations/MessageNavigation.vue'
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

      if (!chats[partnerId]) {
        chats[partnerId] = {
          id: partnerId,
          name:
            msg.rider_id === currentUserId.value
              ? msg.passenger_name || 'Passenger'
              : msg.rider_name || 'Rider',
          lastMessage: msg.content,
          ava: avatarImage,
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

// Select a chat partner
function selectChatPartner(partner) {
  currentChatPartner.value = partner
  if (mobile.value) {
    drawer.value = false
  }
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

        <MessageNavigation
          v-model="drawer"
          :chats="chatList"
          @select-chat="selectChatPartner"
        ></MessageNavigation>

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
            >
              {{ msg.text }}
              <div class="message-time text-caption" :class="{ 'text-right': msg.from === 'me' }">
                {{
                  new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                }}
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
</style>
