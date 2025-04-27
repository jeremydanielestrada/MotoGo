<script setup>
import DashboardLayout from '../layout/dashboards/DashboardLayout.vue'
import { onMounted, onUnmounted } from 'vue'
import { useBookingStore } from '@/stores/bookings'

const bookingStore = useBookingStore()

onMounted(() => {
  bookingStore.subscribeToBookingUpdates()
})
onUnmounted(() => {
  bookingStore.unsubscribeFromBookingUpdates()
})
</script>

<template>
  <DashboardLayout>
    <template #content>
      <v-row>
        <v-col cols="12" md="12" sm="12" width="100%">
          <!-- Notification Button and Menu -->
          <div width="100%">
            <v-list class="overflow-y-auto" style="max-height: 400px">
              <h3 class="text-h6">Notifications</h3>
              <v-list-item
                v-for="notif in bookingStore.bookingNotifications"
                :key="notif.id"
                class="border-thin"
              >
                <span> {{ notif.message }} ({{ notif.timestamp }})</span>
              </v-list-item>
            </v-list>
          </div>
        </v-col>
      </v-row>
    </template>
  </DashboardLayout>
</template>
