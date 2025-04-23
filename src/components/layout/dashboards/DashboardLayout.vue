<script setup>
import { ref } from 'vue'
import { useDisplay } from 'vuetify'
import TopProfileNavigation from '../navigations/TopProfileNavigation.vue'

const { mobile } = useDisplay()

const items = ref([
  { title: 'Rider Name', text: 'Ride Was Canelled' },
  { title: 'Notif 2' },
  { title: 'Notif 3' },
])

// Define hideDisplay (example: set to false by default)
const hideDisplay = ref(false)
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
        <v-btn icon>
          <v-icon>mdi-account</v-icon>
          Profile
        </v-btn>
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

        <!-- Notification Button and Menu -->
        <div class="text-center ms-4">
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

        <v-spacer></v-spacer>

        <v-col
          cols="3"
          md="2"
          sm="3"
          xs="4"
          class="d-flex justify-center align-center ga-1 mx-6"
          v-if="mobile ? hideDisplay : !hideDisplay"
        >
          <v-btn class="active-btn">
            <v-icon>mdi-home</v-icon>
            Home
          </v-btn>
          <v-btn to="/booking">
            <v-icon>mdi-motorbike</v-icon>
            Booking
          </v-btn>
          <v-btn icon to="/message">
            <v-icon size="30">mdi-chat-outline</v-icon>
          </v-btn>
        </v-col>

        <!-- ProfileNavigation   Pending-->
        <!-- <TopProfileNavigation></TopProfileNavigation> -->
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
