<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { useDisplay } from 'vuetify'
import { isAuthenticated } from '@/utils/supabase'
import ProfileNavigation from '../navigations/ProfileNavigation.vue'
import { useBookingStore } from '@/stores/bookings'
import { useRoute } from 'vue-router'

// const icons = ['mdi-facebook', 'mdi-twitter', 'mdi-linkedin', 'mdi-instagram']

const { mobile } = useDisplay()
const bookingStore = useBookingStore()
const route = useRoute()

onMounted(() => {
  bookingStore.subscribeToBookingUpdates()
})
onUnmounted(() => {
  bookingStore.unsubscribeFromBookingUpdates()
})

const hideDisplay = ref(false)
const isLoggedIn = ref(false)

const getLoggedStatus = async () => {
  isLoggedIn.value = await isAuthenticated()
}

onMounted(() => {
  getLoggedStatus()
})

// Function to check if a route is active
const isActive = (path) => route.path === path
</script>

<template>
  <v-responsive>
    <v-app>
      <!-- Bottom Navigation for Mobile -->
      <v-bottom-navigation v-if="mobile" grow class="mobile-nav">
        <v-btn
          :class="{ 'active-btn': isActive('/system/passenger-dashboard') }"
          to="/system/passenger-dashboard"
        >
          <v-icon class="title-home">mdi-home</v-icon>
          <span class="title-home">Home</span>
        </v-btn>
        <v-btn :class="{ 'active-btn': isActive('/bookings') }" to="/bookings">
          <v-icon class="title-home">mdi-motorbike</v-icon>
          <span class="title-home">Booking</span>
        </v-btn>
        <v-btn :class="{ 'active-btn': isActive('/message') }" to="/message">
          <v-icon class="title-home">mdi-chat-outline</v-icon>
          <span class="title-home">Message</span>
        </v-btn>
        <ProfileNavigation v-if="isLoggedIn"></ProfileNavigation>
      </v-bottom-navigation>

      <!-- App Bar -->
      <v-app-bar>
        <v-col
          :cols="mobile ? 9 : 3"
          md="2"
          sm="3"
          xs="4"
          class="d-flex justify-start align-center"
        >
          <div>
            <img class="pt-4" src="/images/motoGO.png" alt="MotoGo Logo" width="40px" />
          </div>
          <h1 class="text-italic text-purple-darken-3">MotoGo</h1>
        </v-col>

        <v-spacer></v-spacer>

        <!-- Notification Button and Menu -->
        <div class="text-center" v-if="!mobile">
          <v-menu location="end" offset-y width="300px" transition="scale-transition">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props">
                <v-icon
                  size="30"
                  :color="bookingStore.subscribeToBookingUpdates() ? 'purple-lighten-4' : 'null'"
                  >mdi-bell-outline</v-icon
                >
              </v-btn>
            </template>

            <v-list>
              <h3 class="text-h6 text-center">Notifications</h3>

              <v-list-item
                v-for="notif in bookingStore.bookingNotifications"
                :key="notif.id"
                class="border-thin"
              >
                <span> {{ notif.message }} ({{ notif.timestamp }})</span>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>

        <!-- mobile-notification-bell -->
        <v-btn v-if="mobile" to="/mobile-notifications">
          <v-icon
            size="30"
            :color="bookingStore.subscribeToBookingUpdates() ? 'purple-lighten-4' : 'null'"
            >mdi-bell-outline</v-icon
          >
        </v-btn>

        <v-col
          cols="12"
          md="4"
          sm="3"
          xs="4"
          class="d-flex justify-center align-center"
          v-if="mobile ? hideDisplay : !hideDisplay"
        >
          <v-btn
            :class="{ 'active-btn': isActive('/system/passenger-dashboard') }"
            to="/system/passenger-dashboard"
          >
            <v-icon class="title-home">mdi-home</v-icon>
            <span class="title-home">Home</span>
          </v-btn>
          <v-btn :class="{ 'active-btn': isActive('/bookings') }" to="/bookings">
            <v-icon class="title-home">mdi-motorbike</v-icon>
            <span class="title-home">Booking</span>
          </v-btn>
          <v-btn :class="{ 'active-btn': isActive('/message') }" to="/message">
            <v-icon class="title-home">mdi-chat-outline</v-icon>
            <span class="title-home">Message</span>
          </v-btn>
          <ProfileNavigation v-if="isLoggedIn"></ProfileNavigation>
        </v-col>
      </v-app-bar>
      <v-main>
        <v-container fluid>
          <slot name="content"></slot>
        </v-container>
      </v-main>
    </v-app>
  </v-responsive>
</template>

<style scoped>
.active-btn {
  border-bottom: 3px solid #6a1b9a;
  color: white;
  width: auto;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.title-home {
  color: black;
  /* border-bottom: 2px solid #6a1b9a; */
}
</style>
