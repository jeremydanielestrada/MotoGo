<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useMessageStore } from '@/stores/messages'
import { supabase } from '@/utils/supabase'
import MessageLayout from '@/components/layout/MessageLayout.vue'
import avatarImage from '/images/ava.png'
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()
const message = ref('')
const drawer = ref(false)
const messageStore = useMessageStore()
const selectedContact = ref(null)
const isLoading = ref(false)
const currentUser = ref(null)

// Use computed property to get messages from the store
const messages = computed(() => messageStore.messages || [])

// Get the current user directly from Supabase
async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting user:', error.message)
    return null
  }

  if (data && data.user) {
    currentUser.value = data.user
    return data.user
  }

  return null
}

// Fetch messages with the user ID
async function fetchMessages() {
  if (!currentUser.value?.id) {
    console.log('No user ID available for fetching messages')
    return
  }

  isLoading.value = true
  try {
    await messageStore.fetchMessages(currentUser.value.id)
  } catch (error) {
    console.error('Error fetching messages:', error)
  } finally {
    isLoading.value = false
  }
}

// Initial setup
onMounted(async () => {
  const user = await getCurrentUser()
  if (user?.id) {
    await fetchMessages()
  } else {
    console.log('User not authenticated')
  }
})

// Send a message using the store
async function sendMessage() {
  if (message.value.trim() !== '' && selectedContact.value && currentUser.value?.id) {
    try {
      await messageStore.sendMessage({
        sender_id: currentUser.value.id,
        passenger_id: selectedContact.value.passenger_id,
        content: message.value,
      })
      message.value = '' // Clear input field after sending
    } catch (error) {
      console.error('Error sending message:', error)
    }
  } else {
    console.warn('Cannot send message: No contact selected, no user ID, or message is empty')
  }
}

// Toggle the drawer state
function toggleDrawer() {
  drawer.value = !drawer.value
}
</script>

<template>
  <MessageLayout>
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
        <!-- DRAWER -->
        <v-navigation-drawer v-model="drawer" location="left" :width="300" v-if="mobile">
          <v-list>
            <v-list-item
              flat
              class="cursor-pointer"
              v-for="(msg, index) in messages"
              :key="index"
              @click="
                () => {
                  selectedContact = msg
                  drawer = false
                }
              "
            >
              <div class="d-flex align-center">
                <img :src="msg.ava || avatarImage" alt="Avatar" width="50" class="avatar-img" />
                <div class="title-container">
                  <v-card-title class="text-h6 mb-1">{{ msg.from || 'Unknown' }}</v-card-title>
                  <v-card-subtitle class="text-subtitle-2 text-truncate">
                    {{ msg.content || 'No content available' }}
                  </v-card-subtitle>
                </div>
              </div>
            </v-list-item>
          </v-list>
        </v-navigation-drawer>

        <!-- CHAT AREA -->
        <v-col cols="12" class="d-flex flex-column" style="padding: 0; margin: 0">
          <!-- HEADER -->
          <v-card
            flat
            class="d-flex align-center py-3"
            elevation="0"
            style="border-bottom: 1px solid #ddd; margin: 0"
          >
            <v-icon v-if="mobile" @click="toggleDrawer" class="me-3">mdi-menu</v-icon>
            <template v-if="selectedContact">
              <v-avatar>{{ selectedContact?.from?.charAt(0) || '?' }}</v-avatar>
              <div class="title-container">
                <v-card-title class="text-h6 mb-1">{{
                  selectedContact?.from || 'Unknown'
                }}</v-card-title>
                <v-card-subtitle class="text-subtitle-2">{{
                  selectedContact?.user_meta_data?.phone || 'N/A'
                }}</v-card-subtitle>
              </div>
            </template>
          </v-card>

          <v-divider></v-divider>

          <!-- Loading state -->
          <v-container v-if="isLoading" class="text-center my-4">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p class="mt-2">Loading messages...</p>
          </v-container>

          <!-- No authentication state -->
          <v-container v-else-if="!currentUser?.id" class="text-center my-4">
            <v-alert type="info" variant="tonal"> Please log in to view your messages </v-alert>
          </v-container>

          <!-- No selected contact state -->
          <v-container v-else-if="!selectedContact" class="text-center my-4">
            <h3>Select a conversation to start messaging</h3>
          </v-container>

          <!-- No messages state -->
          <v-container v-else-if="!selectedContact.messages?.length" class="text-center my-4">
            <h3>No messages yet</h3>
            <p class="text-subtitle-1">Start the conversation by sending a message</p>
          </v-container>

          <!-- MESSAGE DISPLAY AREA -->
          <div
            v-else
            class="flex-grow-1 px-4 py-3 message-container"
            style="background-color: #f5f5f5; margin: 0; padding: 16px; overflow-y: auto"
          >
            <div
              v-for="(msg, index) in selectedContact?.messages || []"
              :key="index"
              :class="[
                'message-bubble my-2 pa-2 rounded-pill',
                msg.from === 'me'
                  ? 'align-self-end bg-purple-darken-4 text-white ms-auto'
                  : 'align-self-start bg-light text-black me-auto',
              ]"
              style="max-width: 70%; display: block"
            >
              {{ msg.content || 'No content available' }}
            </div>
          </div>

          <!-- INPUT FIELD -->
          <v-sheet
            v-if="selectedContact && currentUser?.id"
            class="d-flex align-center px-4 py-3 mb-0"
            elevation="2"
            style="background-color: white; margin: 0; padding: 8px 16px"
          >
            <v-text-field
              v-model="message"
              :append-icon="message ? 'mdi-send' : 'mdi-microphone'"
              type="text"
              variant="outlined"
              density="compact"
              rounded="pill"
              class="flex-grow-1"
              @click:append="sendMessage"
              @keyup.enter="sendMessage"
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
}

.message-bubble {
  word-break: break-word;
}
</style>
