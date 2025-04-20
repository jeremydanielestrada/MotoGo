<script setup>
import { ref } from 'vue'
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()

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
          <v-icon>mdi-chat</v-icon>
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
          :cols="mobile ? 12 : 3"
          md="2"
          sm="3"
          xs="4"
          class="d-flex justify-center align-center"
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
          class="d-flex justify-center align-center ga-1 mx-3"
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
          <v-btn icon>
            <v-icon size="30">mdi-account</v-icon>
          </v-btn>
          <v-btn icon to="/message">
            <v-icon size="30">mdi-chat</v-icon>
          </v-btn>
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
</style>
