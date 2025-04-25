<script setup>
import { ref, onMounted } from 'vue'
import { useDisplay } from 'vuetify' // Ensure this is correctly imported
import { isAuthenticated } from '@/utils/supabase'
import ProfileNavigation from '../navigations/ProfileNavigation.vue'

const { mobile, mdAndUp, smAndDown } = useDisplay() // Ensure mdAndUp is destructured
const drawer = ref(true) // Set default to true

const items = ref([
  { title: 'Rider Name', text: 'Ride Was Canelled' },
  { title: 'Notif 2' },
  { title: 'Notif 3' },
])

// Define hideDisplay (example: set to false by default)
const hideDisplay = ref(false)

// Define emit for the toggle-navigation event
const emit = defineEmits(['toggle-navigation'])

// Modify toggleDrawer to only work on mobile
function toggleDrawer() {
  if (smAndDown.value) {
    drawer.value = !drawer.value
    emit('toggle-navigation', drawer.value)
  }
}

const isLoggedIn = ref(false)

const getLoggedStatus = async () => {
  isLoggedIn.value = await isAuthenticated()
}

onMounted(() => {
  getLoggedStatus()
})
</script>

<template>
  <v-responsive>
    <v-app>
      <!-- Bottom Navigation for Mobile -->
      <v-bottom-navigation v-if="mobile" grow class="mobile-nav">
        <v-btn icon to="/message">
          <v-icon color="purple-darken-3">mdi-chat-outline</v-icon>
          Message
        </v-btn>
        <!-- Notification Button and Menu -->
        <!-- <v-btn icon>
          <v-icon color="purple-darken-3">mdi-bell-outline</v-icon>
          Notifications
        </v-btn> -->
        <!-- ProfileNavigation   Pending-->
        <ProfileNavigation v-if="isLoggedIn"></ProfileNavigation>
      </v-bottom-navigation>

      <!-- App Bar -->
      <v-app-bar>
        <template v-slot:prepend>
          <v-app-bar-nav-icon v-if="smAndDown" @click="toggleDrawer"></v-app-bar-nav-icon>
        </template>

        <v-col
          :cols="mobile ? 9 : 3"
          md="2"
          sm="3"
          xs="4"
          class="d-flex justify-start align-center"
        >
          <div>
            <img class="pt-4" src="/public/images/motoGO.png" alt="MotoGo Logo" width="40px" />
          </div>
          <h1 class="text-italic text-purple-darken-3">MotoGo</h1>
        </v-col>

        <v-spacer></v-spacer>

        <v-col
          cols="3"
          md="2"
          sm="3"
          xs="4"
          class="d-flex justify-center align-center ga-1"
          v-if="mobile ? hideDisplay : !hideDisplay"
        >
          <!-- Notification Button and Menu -->
          <div class="text-center">
            <v-menu location="end" offset-y width="300px" transition="scale-transition">
              <template v-slot:activator="{ props }">
                <v-btn color="primary" v-bind="props">
                  <v-icon size="30" color="purple-darken-3">mdi-bell-outline</v-icon>
                </v-btn>
              </template>

              <v-list>
                <h3 class="text-h6 text-center">Notifications</h3>

                <v-list-item
                  v-for="(item, index) in items"
                  :key="index"
                  :value="index"
                  class="border-thin"
                >
                  <v-list-item-title
                    ><b>{{ item.title }}</b></v-list-item-title
                  >
                  <span> {{ item.text }}</span>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
          <v-btn icon to="/message">
            <v-icon size="30" color="purple-darken-3">mdi-chat-outline</v-icon>
          </v-btn>
          <!-- ProfileNavigation   Pending-->
          <ProfileNavigation v-if="isLoggedIn"></ProfileNavigation>
        </v-col>
      </v-app-bar>

      <!-- Drawer -->
      <v-navigation-drawer
        v-model="drawer"
        location="start"
        :mobile="smAndDown"
        width="250"
        class="d-flex flex-column"
      >
        <slot name="drawer"></slot>
      </v-navigation-drawer>

      <v-main>
        <v-container fluid>
          <slot name="content"></slot>
        </v-container>
      </v-main>
    </v-app>
  </v-responsive>
</template>

<style scoped>
.text-italic {
  font-style: italic;
  font-weight: 600;
}

.mobile-nav {
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 10;
}

.active-btn {
  background-color: #6a1b9a !important;
  color: white !important;
  border-radius: 8px;
}

.position-relative {
  position: relative;
}
</style>
