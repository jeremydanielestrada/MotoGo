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
    alert('Please rate before submitting.')
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
    <v-row class="align-center justify-space-between">
      <v-col cols="auto" class="d-flex align-center">
        <v-btn variant="text" class="text-purple-darken-3" to="/system/passenger-dashboard">
          <v-icon size="30">mdi-keyboard-backspace</v-icon>
          <span class="d-none d-sm-inline">Back to home</span>
        </v-btn>
      </v-col>

      <v-col cols="auto"></v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <h1 class="text-h6 text-center pb-3">Booking History</h1>
        <v-table>
          <thead>
            <tr>
              <th class="text-left">Booking ID</th>
              <th class="text-left">Rider ID</th>
              <th class="text-left">Rate Rider</th>
              <th class="text-left"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in bookingHistory" :key="booking.id">
              <td>{{ booking.id }}</td>
              <td>{{ booking.rider_id }}</td>
              <td>
                <div style="display: flex; align-items: center; justify-content: space-between">
                  <v-rating v-model="ratings[booking.id]" density="compact"></v-rating>
                  <v-btn size="small" color="purple-darken-3" @click="submitRating(booking.id)">
                    Submit
                  </v-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
  </v-container>
</template>
<style>
@media (max-width: 677px) {
  thead {
    display: none;
  }

  tbody tr {
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
    border-bottom: 1px solid #eee;
    padding-bottom: 15px;
  }

  tbody td {
    display: block;
    width: 100%;
    padding-left: 0;
    text-align: left;
    position: relative;
    padding-bottom: 5px;
  }

  tbody td::before {
    display: block;
    font-weight: bold;
    color: #777;
    margin-bottom: 5px;
  }

  tbody td:nth-child(1)::before {
    content: 'Booking ID:';
  }

  tbody td:nth-child(2)::before {
    content: 'Rider ID:';
  }

  tbody td:nth-child(3) > div {
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: 15px;
  }

  tbody td:nth-child(3)::before {
    content: 'Rate Rider:';
    margin-bottom: 0;
    margin-right: 8px;
  }

  tbody td:nth-child(3)::before {
    content: 'Rate Rider:';
  }
}
</style>
