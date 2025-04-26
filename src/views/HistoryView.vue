<script setup>
import { ref, onMounted } from 'vue'
import { useBookingStore } from '@/stores/bookings'

const bookingStore = useBookingStore()
const bookingHistory = ref([])
const ratings = ref({}) // Store ratings for each booking

onMounted(async () => {
  await bookingStore.getBooks() // Fetch all bookings
  bookingHistory.value = bookingStore.getBookings
})

// Submit a rating for a rider
async function submitRating(bookingId) {
  const rating = ratings.value[bookingId]
  if (!rating) {
    alert('Please select a rating before submitting.')
    return
  }

  const { error } = await bookingStore.rateRider(bookingId, rating)
  if (error) {
    alert('Failed to submit rating. Please try again.')
  } else {
    alert('Rating submitted successfully!')
  }
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h6 text-center">Booking History</h1>
        <v-table>
          <thead>
            <tr>
              <th class="text-left">Booking ID</th>
              <th class="text-left">Rider ID</th>
              <th class="text-left">Status</th>
              <th class="text-center">Rate Rider</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in bookingHistory" :key="booking.id">
              <td>{{ booking.id }}</td>
              <td>{{ booking.rider_id }}</td>
              <td>{{ booking.status }}</td>
              <td class="text-center">
                <v-rating v-model="ratings[booking.id]" class="ma-2" density="compact"></v-rating>
                <v-btn size="small" color="primary" @click="submitRating(booking.id)">
                  Submit
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
  </v-container>
</template>
