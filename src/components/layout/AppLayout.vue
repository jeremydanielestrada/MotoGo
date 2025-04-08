<script setup>
import { ref } from 'vue'

const theme = ref(localStorage.getItem('theme') ?? 'light')

function onClick() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('theme', theme.value)
}
</script>

<template>
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
