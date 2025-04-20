<script setup>
import { ref } from 'vue'

const message = ref('')
const messages = ref([])

const iconIndex = ref(0)

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
</script>

<template>
  <v-row class="bg-bg1" no-gutters>
    <!-- LIST OF MESSAGES -->
    <v-col cols="12" md="4">
      <v-card class="my-4 mx-2" elevation="10" max-width="500" height="620">
        <v-row>
          <v-col cols="12" md="4" sm="6" class="pt-4 ml-4 mt-4">
            <router-link to="passenger-dashboard"
              ><v-icon size="30">mdi-keyboard-backspace</v-icon></router-link
            >
          </v-col>
          <v-col cols="12" md="4" sm="6" class="d-flex justify-center mt-4">
            <h2>Messages</h2>
          </v-col>
        </v-row>
        <div class="d-flex align-center px-4 pt-4">
          <img src="/public/images/ava.png" alt="Avatar" width="60" class="avatar-img" />
          <div class="title-container">
            <v-card-title>Ava Tar</v-card-title>
            <v-card-subtitle class="text-subtitle-2">Naa diri sir hahahhaha</v-card-subtitle>
          </div>
          <v-spacer></v-spacer>
        </div>
      </v-card>
    </v-col>

    <!-- PROFILE HEADER -->
    <v-col cols="12" md="8">
      <v-card class="my-4 d-flex flex-column" elevation="10" max-width="880" height="620">
        <!-- Header -->
        <div class="d-flex align-center px-4 pt-4">
          <img src="/public/images/ava.png" alt="Avatar" width="60" class="avatar-img" />
          <div class="title-container">
            <v-card-title>Ava Tar</v-card-title>
            <v-card-subtitle class="text-subtitle-2">+09465775869</v-card-subtitle>
          </div>
          <v-spacer></v-spacer>
          <v-icon class="pr-5">mdi-phone-outline</v-icon>
        </div>

        <v-divider class="my-2" color="purple"></v-divider>

        <!-- MESSAGE SENT-->
        <div class="d-flex flex-column flex-grow-1 px-4 pb-4">
          <!-- Message Display Area -->
          <div class="flex-grow-1 overflow-y-auto d-flex flex-column">
            <div
              v-for="(msg, index) in messages"
              :key="index"
              class="my-2 pa-2 align-self-end bg-purple-darken-4 rounded-pill"
              style="max-width: 70%"
            >
              {{ msg.text }}
            </div>
          </div>
          <v-divider></v-divider>
        </div>

        <!-- Input Field at Bottom -->
        <v-sheet class="d-flex align-center px-4" elevation="2">
          <v-text-field
            v-model="message"
            :append-icon="message ? 'mdi-send' : 'mdi-microphone'"
            type="text"
            variant="solo"
            density="compact"
            rounded="pill"
            class="mt-3 flex-grow-1"
            @click:append="sendMessage"
          />
        </v-sheet>
      </v-card>
    </v-col>
  </v-row>
</template>
<style scoped>
/* .border-card {
  border: 5px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
} */
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
