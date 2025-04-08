<script setup>
import { ref } from 'vue'

const theme = ref('light')

function onClick() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>

<template>
  <v-responsive class="border rounded">
    <v-app :theme="theme" class="bg-purple-lighten-4">
      <!-- Top Row for Theme Toggle Button -->
      <v-row class="pe-5 pt-4" justify="end">
        <v-btn
          :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          elevation="9"
          @click="onClick"
          width="40px"
          color="purple-darken-1"
          class="border rounded-shaped"
        ></v-btn>
      </v-row>

      <!-- Main Content -->
      <v-main class="bg-bg">
        <v-container>
          <v-row>
            <slot name="content"></slot>
          </v-row>
        </v-container>
      </v-main>
    </v-app>
  </v-responsive>
</template>
