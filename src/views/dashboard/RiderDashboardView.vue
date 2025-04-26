<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/utils/supabase'
import RiderDashboardLayout from '@/components/layout/dashboards/RiderDashboardLayout.vue'
import { LMap, LTileLayer, LMarker, LPopup, LPolyline } from '@vue-leaflet/vue-leaflet'

// Map setup
const map = ref(null)
const center = ref([12.8797, 121.774]) // Default center (Philippines)
const zoom = ref(6)

// Ride requests and booking details
const rideRequests = ref([])
const selectedRide = ref(null)
const routePoints = ref([])

// Average rating
const averageRating = ref(0)

// Fetch the rider's average rating
async function fetchAverageRating() {
  const { data, error } = await supabase
    .from('bookings')
    .select('rating')
    .eq('rider_id', supabase.auth.user()?.id) // Filter by rider ID
    .not('rating', 'is', null) // Exclude bookings without ratings

  if (error) {
    console.error('Error fetching average rating:', error)
    return
  }

  if (data.length > 0) {
    const total = data.reduce((sum, item) => sum + item.rating, 0)
    averageRating.value = (total / data.length).toFixed(1)
  }
}

// Fetch ride requests in real-time
const fetchRideRequests = () => {
  supabase
    .channel('public:bookings')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
      const newRequest = payload.new
      if (newRequest.status === 'pending') {
        rideRequests.value.push(newRequest)
      }
    })
    .subscribe()
}

// Accept a ride request
const acceptRide = (ride) => {
  selectedRide.value = ride
  center.value = [ride.pickup_lat, ride.pickup_lng]
  routePoints.value = [
    [ride.pickup_lat, ride.pickup_lng],
    [ride.dropoff_lat, ride.dropoff_lng],
  ]

  // Update booking status in Supabase
  supabase
    .from('bookings')
    .update({ status: 'accepted' })
    .eq('id', ride.id)
    .then(() => {
      rideRequests.value = rideRequests.value.filter((r) => r.id !== ride.id)
    })
}

// Reject a ride request
const rejectRide = (ride) => {
  supabase
    .from('bookings')
    .update({ status: 'rejected' })
    .eq('id', ride.id)
    .then(() => {
      rideRequests.value = rideRequests.value.filter((r) => r.id !== ride.id)
    })
}

// Finish the ongoing ride
const finishRide = () => {
  if (!selectedRide.value) return

  // Update booking status in Supabase
  supabase
    .from('bookings')
    .update({ status: 'completed' })
    .eq('id', selectedRide.value.id)
    .then(() => {
      alert('Ride has been successfully completed!')
      selectedRide.value = null
      routePoints.value = []
      center.value = [12.8797, 121.774] // Reset map center to default
    })
    .catch((error) => {
      console.error('Error finishing ride:', error)
      alert('Failed to complete the ride. Please try again.')
    })
}

// Initialize real-time listener on mount
onMounted(() => {
  fetchRideRequests()
  fetchAverageRating()
})
</script>

<template>
  <RiderDashboardLayout>
    <!-- Ride Request -->
    <template #drawer>
      <h5 class="text-h6 text-center py-2">Ride Request</h5>
      <v-divider></v-divider>
      <v-list class="mx-2">
        <v-list-item
          v-for="ride in rideRequests"
          :key="ride.id"
          border="thin"
          class="py-2 my-2"
          rounded
          justify="center"
          align="center"
        >
          <div class="d-flex justify-center align-center flex-column ga-1">
            <v-avatar
              size="50"
              color="primary"
              class="d-flex justify-center align-center text-white"
            >
              {{
                ride.passenger_name
                  .split(' ')
                  .map((name) => name[0])
                  .join('')
              }}
            </v-avatar>
            <h3>{{ ride.passenger_name }}</h3>
          </div>
          <span>{{ ride.pickup_address }} to {{ ride.dropoff_address }}</span>

          <div class="d-flex justify-center align-center ga-1 py-2 mx-3">
            <v-btn size="x-small" color="success" @click="acceptRide(ride)">ACCEPT</v-btn>
            <v-btn size="x-small" color="red" @click="rejectRide(ride)">REJECT</v-btn>
          </div>
        </v-list-item>
      </v-list>
    </template>

    <template #content>
      <v-row>
        <v-col cols="12" md="8">
          <v-card>
            <v-card-text>
              <div style="height: 500px; width: 100%; z-index: 0">
                <l-map ref="map" v-model:zoom="zoom" :center="center" style="height: 100%">
                  <l-tile-layer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    layer-type="base"
                    name="OpenStreetMap"
                  ></l-tile-layer>

                  <!-- Pickup Marker -->
                  <l-marker
                    v-if="selectedRide"
                    :lat-lng="[selectedRide.pickup_lat, selectedRide.pickup_lng]"
                  >
                    <l-popup>Pickup Location</l-popup>
                  </l-marker>

                  <!-- Dropoff Marker -->
                  <l-marker
                    v-if="selectedRide"
                    :lat-lng="[selectedRide.dropoff_lat, selectedRide.dropoff_lng]"
                  >
                    <l-popup>Drop-off Location</l-popup>
                  </l-marker>

                  <!-- Route line -->
                  <l-polyline v-if="routePoints.length > 0" :lat-lngs="routePoints" color="blue" />
                </l-map>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Booking status -->
        <v-col cols="12" md="4" sm="8">
          <v-card height="530px">
            <v-card-text>
              <div>
                <h2 class="text-center py-1">Ongoing Ride</h2>
              </div>
              <v-divider></v-divider>

              <div v-if="selectedRide">
                <p>
                  <strong>Passenger:</strong> {{ selectedRide.passenger_name }} <br />
                  <strong>Pickup:</strong> {{ selectedRide.pickup_address }} <br />
                  <strong>Drop-off:</strong> {{ selectedRide.dropoff_address }} <br />
                  <strong>Status:</strong> Accepted
                </p>
                <v-btn block color="success" class="mt-2" @click="finishRide">
                  Confirm Finish Ride
                </v-btn>
              </div>
              <p v-else>No ongoing ride</p>
            </v-card-text>
          </v-card>
          <div class="d-flex justify-center align-center">
            <h3 text-h6>Ratings:</h3>
            <v-rating :length="5" :size="50" :model-value="3" active-color="purple-darken-3" />
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <h2 class="text-center">Your Average Rating</h2>
          <v-rating :value="averageRating" readonly size="large" />
        </v-col>
      </v-row>
    </template>
  </RiderDashboardLayout>
</template>

<style scoped>
.leaflet-container {
  z-index: 1;
}
</style>
