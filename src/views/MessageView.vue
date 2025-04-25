<script setup>
import { ref, onMounted, computed } from 'vue'
import { useMessagStore } from '@/stores/messages'
import { useAuthUserStore } from '@/stores/authUser'
import MessageLayout from '@/components/layout/MessageLayout.vue'
import avatarImage from '/images/ava.png'
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()
const message = ref('')
const drawer = ref(false)
const messageStore = useMessagStore()
const authUserStore = useAuthUserStore()
const selectedContact = ref(null)

// Use computed property to get messages from the store
const messages = computed(() => messageStore.messages || [])

// Fetch messages on component mount
onMounted(async () => {
  try {
    if (authUserStore.userData?.id) {
      await messageStore.fetchMessages()
    } else {
      console.error('User not logged in')
    }
  } catch (error) {
    console.error('Error fetching messages:', error)
  }
})

// Send a message using the store
async function sendMessage() {
  if (message.value.trim() !== '' && selectedContact.value) {
    try {
      await messageStore.sendMessage({
        passenger_id: selectedContact.value.passenger_id,
        content: message.value,
      })
      message.value = '' // Clear input field after sending
    } catch (error) {
      console.error('Error sending message:', error)
    }
  } else {
    console.warn('Cannot send message: No contact selected or message is empty')
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

          <h1 class="text-center" v-if="!message">No messages yet</h1>

          <!-- MESSAGE DISPLAY AREA -->
          <div
            v-if="selectedContact"
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
            v-if="selectedContact"
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
