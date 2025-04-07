<script setup>
import { ref } from 'vue'

<<<<<<< HEAD
const theme = ref('light')

function onClick() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
=======
const theme = ref(localStorage.getItem('theme') ?? 'light')

function onClick() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('theme', theme.value)
>>>>>>> origin/development
}
</script>

<template>
<<<<<<< HEAD
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
=======
  <v-responsive>
    <v-app :theme="theme">
      <v-app-bar :color="theme === 'light' ? 'purple-lighten-1' : 'purple-darken-1'" border>
        <v-spacer></v-spacer>

        <v-btn
          :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          slim
          @click="onClick"
        ></v-btn>
      </v-app-bar>
      <v-main>
        <v-container>
          <slot name="content"></slot>
        </v-container>
      </v-main>
      <v-footer border app :color="theme === 'light' ? 'purple-lighten-1' : 'purple-darken-1'">
        new project</v-footer
      >
    </v-app>
  </v-responsive>
</template>

<style></style>
>>>>>>> origin/development
