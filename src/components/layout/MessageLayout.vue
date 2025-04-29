<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { supabase } from '@/utils/supabase'
import { useAuthUserStore } from '@/stores/authUser'
const { mdAndUp, smAndDown } = useDisplay()
const drawer = ref(false)
const userRole = ref(null)
const authUserStore = useAuthUserStore()

function toggleDrawer() {
  drawer.value = !drawer.value
}

// Check if user is a driver directly from Supabase
async function checkUserRole() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting user:', error.message)
    return null
  }

  if (data && data.user) {
    // Store the role in a local ref
    userRole.value = data.user.user_metadata?.is_driver === true ? 'driver' : 'passenger'
    return data.user
  }

  return null
}

// Determine dashboard path based on direct user role check
const dashboardPath = computed(() => {
  return userRole.value === 'driver' ? '/system/rider-dashboard' : '/system/passenger-dashboard'
})

// Combine the onMounted hooks
onMounted(async () => {
  if (mdAndUp.value) {
    drawer.value = false // Always start with drawer closed
  }

  // Get user role directly from Supabase
  await checkUserRole()
})

watch(
  mdAndUp,
  (isDesktop) => {
    if (isDesktop) drawer.value = false // Always close drawer on desktop
  },
  { immediate: true },
)

function handleToggleNavigation(state) {
  drawer.value = state
}
</script>

<template>
  <v-app>
    <v-app-bar color="purple-darken-3">
      <template v-slot:append>
        <v-icon v-show="smAndDown" @click="toggleDrawer" class="me-4" size="30"
          >mdi-message-outline</v-icon
        >
      </template>

      <!-- Use the computed dashboardPath -->
      <v-btn :to="dashboardPath" v-if="mdAndUp">
        <v-icon> mdi-keyboard-backspace </v-icon>
        Back to Dashboard
      </v-btn>

      <v-btn :to="dashboardPath" v-if="!mdAndUp">
        <v-icon class="ms-4" size="30">mdi-keyboard-backspace</v-icon>
      </v-btn>

      <v-spacer></v-spacer>
      <h1 class="text-h6 font-weight-bold me-5">Messages</h1>
    </v-app-bar>

    <v-main>
      <slot name="content" :drawer="drawer" :onToggleNavigation="handleToggleNavigation"> </slot>
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
