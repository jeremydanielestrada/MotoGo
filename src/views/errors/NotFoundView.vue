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
    <v-row>
      <v-col cols="12" class="d-flex justify-center">
        <img src="/images/ops7.png" :width="mobile ? '300px' : '700px'" />
      </v-col>
      <v-col cols="12">
        <div>
          <h1 class="oops-title d-flex justify-center">Oops! Page Not Found</h1>

          <div>
            <h2 class="Sub-name d-flex justify-center">
              We can't seem to find the page you're looking for.
            </h2>
            <br />
            <div class="d-flex justify-center">
              <v-btn class="back-button" :to="dashboardPath">
                <v-icon start>mdi-arrow-left</v-icon>Back to Home</v-btn
              >
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
<style>
.oops-title {
  font-size: 50px;
  align-items: center;
  color: purple;
}

.Sub-name {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
.back-button {
  background-color: #ba68c8 !important;
  color: white !important;
  border: 2px solid #ba68c8 !important;
  border-radius: 15px !important;
}
</style>
