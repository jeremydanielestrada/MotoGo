<script setup>
import { ref, watch, onMounted } from 'vue'
import { useDisplay } from 'vuetify' // Import useDisplay from Vuetify

const { mdAndUp, smAndDown } = useDisplay()
const drawer = ref(false)

// Define emit for the toggle-navigation event
const emit = defineEmits(['toggle-navigation'])

function onClick() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('theme', theme.value)
}

function toggleDrawer() {
  drawer.value = !drawer.value
  // Emit an event to notify the parent component
  emit('toggle-navigation', drawer.value)
}

onMounted(() => {
  drawer.value = false // Always start with drawer closed
})

watch(
  mdAndUp,
  (isDesktop) => {
    if (isDesktop) {
      drawer.value = false // Always close drawer on desktop
    }
  },
  { immediate: true },
)
</script>

<template>
  <v-app>
    <v-app-bar color="purple-darken-3">
      <template v-slot:append>
        <v-icon v-show="smAndDown" @click="toggleDrawer" class="me-4" size="30"
          >mdi-message-outline</v-icon
        >
      </template>
      <v-icon class="ms-4" size="30" v-if="mdAndUp ? false : true">mdi-keyboard-backspace</v-icon>

      <v-spacer></v-spacer>
      <h1 class="text-h6 font-weight-bold me-5">Messages</h1>

      <!-- <v-icon class="mx-10" v-show="mdAndUp" size="40" @click="showFormModal = true"
        >mdi-account-circle-outline</v-icon
      > -->
    </v-app-bar>

    <v-main>
      <slot name="content" :drawer="drawer"></slot>
    </v-main>
  </v-app>
</template>

<style>
#nav-items ul {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 1.5rem;
}

#nav-items ul li {
  cursor: pointer;
  margin: 0 1rem;
}

.v-main {
  background-color: var(--v-background);
  min-height: calc(100vh - 104px); /* Subtract header and footer height */
}
</style>
