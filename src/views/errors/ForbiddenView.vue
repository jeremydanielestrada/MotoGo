<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/utils/supabase'
import { useDisplay } from 'vuetify'

const userRole = ref(null)
const { mobile } = useDisplay()

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

onMounted(async () => {
  await checkUserRole()
})
</script>
<template>
  <v-container>
    <v-row
      ><v-col cols="12" class="d-flex justify-center">
        <img src="/images/ops10.png" :width="mobile ? '300px' : '700px'" /> </v-col
    ></v-row>
    <v-row>
      <v-col cols="12">
        <h1 class="d-flex justify-center title-forbid">Access Denied...</h1>
        <div class="d-flex justify-center sub-forbid">
          <h2>You don't have permission to access this page.</h2>
        </div>
        <br />
        <div class="d-flex justify-center">
          <v-btn class="back-button" :to="dashboardPath">
            <v-icon start>mdi-arrow-left</v-icon>
            Back to Home</v-btn
          >
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
<style>
.title-forbid {
  font-size: 50px;
  color: purple;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
.sub-forbid {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>
