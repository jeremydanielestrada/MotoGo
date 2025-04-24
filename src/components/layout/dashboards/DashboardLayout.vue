<script setup>
import { onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { isAuthenticated } from '@/utils/supabase'
import ProfileNavigation from '../navigations/ProfileNavigation.vue'

const { mobile } = useDisplay()

const items = ref([
  { title: 'Rider Name', text: 'Ride Was Canelled' },
  { title: 'Notif 2' },
  { title: 'Notif 3' },
])

// Define hideDisplay (example: set to false by default)
const hideDisplay = ref(false)

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
        <v-btn class="active-btn">
          <v-icon>mdi-home</v-icon>
          Home
        </v-btn>
        <v-btn to="/bookings">
          <v-icon>mdi-motorbike</v-icon>
          Booking
        </v-btn>
        <v-btn icon to="/message">
          <v-icon>mdi-chat-outline</v-icon>
          Message
        </v-btn>
        <!-- ProfileNavigation   Pending-->
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
            <img class="pt-4" src="/public/images/motoGO.png" alt="MotoGo Logo" width="40px" />
          </div>
          <h1 class="text-italic text-purple-darken-3">MotoGo</h1>
        </v-col>

        <v-spacer></v-spacer>

        <!-- Notification Button and Menu -->
        <div class="text-center" v-if="!mobile">
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

        <!-- mobile-notification-bell -->
        <v-btn color="primary" v-if="mobile" to="/mobile-notifications">
          <v-icon size="30" color="purple-darken-3">mdi-bell-outline</v-icon>
        </v-btn>

        <v-col
          cols="12"
          md="4"
          sm="3"
          xs="4"
          class="d-flex justify-center align-center"
          v-if="mobile ? hideDisplay : !hideDisplay"
        >
          <v-btn>
            <v-icon>mdi-home</v-icon>
            Home
          </v-btn>
          <v-btn to="/bookings">
            <v-icon>mdi-motorbike</v-icon>
            Booking
          </v-btn>
          <v-btn to="/message">
            <v-icon>mdi-chat-outline</v-icon>
            Message
          </v-btn>
          <!-- ProfileNavigation   Pending-->
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
