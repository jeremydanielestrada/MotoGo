<script setup>
import { ref } from 'vue'

const theme = ref('light')

function onClick() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>

<template>
  <v-responsive class="border rounded">
    <v-app :theme="theme" class="bg-white">
      <!-- Top Row for Theme Toggle Button -->
      <v-row class="pe-5 pt-4" justify="start">
        <v-col> </v-col>
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
