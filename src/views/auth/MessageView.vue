<script setup>
import { ref } from 'vue'
import MessageLayout from '@/components/layout/MessageLayout.vue'
import MessageNavigation from '@/components/layout/navigations/MessageNavigation.vue'
import avatarImage from '/images/ava.png'
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()

const message = ref('')
const messages = ref([
  {
    text: 'Hello, how can I help you today?',
    from: 'Avatar',
    ava: avatarImage,
  },
])

const iconIndex = ref(0)
const hideDisplay = ref(false)
const drawer = ref(false) // Control visibility of MessageNavigation

function sendMessage() {
  if (message.value.trim() !== '') {
    messages.value.push({ text: message.value, from: 'me' })
  }
  resetIcon()
  clearMessage()
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
                <router-link to="passenger-dashboard">
                  <v-icon size="30" class="mr-2">mdi-keyboard-backspace</v-icon>
                </router-link>
                <h2 class="text-h6 font-weight-bold mb-0">Chats</h2>
              </v-col>
            </v-row>
          </v-card>
          <v-divider></v-divider>
          <v-card
            flat
            class="py-3 mt-3 mx-3 cursor-pointer"
            elevation="0"
            v-for="(msg, index) in messages"
            :key="index"
            style="border: 1px solid #ddd; border-radius: 8px"
          >
            <div class="d-flex align-center">
              <img :src="msg.ava" alt="Avatar" width="50" class="avatar-img mr-3" />
              <div class="title-container">
                <v-card-title class="text-h6 mb-1">{{ msg.from }}</v-card-title>
                <v-card-subtitle class="text-subtitle-2 text-truncate">
                  {{ msg.text }}
                </v-card-subtitle>
              </div>
            </div>
          </v-card>
        </v-col>

        <MessageNavigation v-model="drawer"></MessageNavigation>

        <!-- CHAT AREA -->
        <v-col cols="12" md="9" class="d-flex flex-column" style="padding: 0; margin: 0">
          <!-- HEADER -->
          <v-card
            flat
            class="d-flex align-center py-3"
            elevation="0"
            style="border-bottom: 1px solid #ddd; margin: 0"
          >
            <img src="/public/images/ava.png" alt="Avatar" width="50" class="avatar-img mr-3" />
            <div class="title-container">
              <v-card-title class="text-h6 mb-1">Ava Tar</v-card-title>
              <v-card-subtitle class="text-subtitle-2">+09465775869</v-card-subtitle>
            </div>
            <v-spacer></v-spacer>
            <v-icon size="24" class="me-3">mdi-phone-outline</v-icon>
          </v-card>

          <v-divider></v-divider>

          <!-- MESSAGE DISPLAY AREA -->
          <div
            class="flex-grow-1 px-4 py-3"
            style="background-color: #f5f5f5; margin: 0; padding: 0"
          >
            <div
              v-for="(msg, index) in messages"
              :key="index"
              :class="[
                'my-2 pa-2 rounded-pill',
                msg.from === 'me'
                  ? 'align-self-end bg-purple-darken-4 text-white'
                  : 'align-self-start bg-light text-black',
                ' bg-purple-darken-4 text-white',
              ]"
              style="max-width: 70%"
            >
              {{ msg.text }}
            </div>
          </div>

          <!-- INPUT FIELD -->
          <v-sheet
            class="d-flex align-center px-4 py-3 mb-0"
            elevation="2"
            style="background-color: white; margin: 0; padding: 0"
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
.bg-bg1 {
  background-color: #e1bee7;
}
</style>
