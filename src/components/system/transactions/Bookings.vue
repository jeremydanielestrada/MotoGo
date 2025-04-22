<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { LMap, LTileLayer, LMarker, LPopup, LIcon, LPolyline } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import DashboardLayout from '@/components/layout/dashboards/DashboardLayout.vue'

// Fix for Leaflet marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const router = useRouter()
const map = ref(null)
const zoom = ref(13)
const center = ref([12.8797, 121.774]) // Default center (Philippines)
const loading = ref(false)
const bookingComplete = ref(false)
const bookingReference = ref('')

// Icons for markers
const pickupIcon = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png'
const dropoffIcon = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png'

// API key for geocoding service (replace with your API key)
const GEOCODING_API_KEY = '1cdf6200a1854ae2bdb46779f9c9d1ab'

// Suggestions for pickup and dropoff
const pickupSuggestions = ref([])
const dropoffSuggestions = ref([])

// Fetch location suggestions
const fetchSuggestions = async (query, type) => {
  if (!query) {
    if (type === 'pickup') pickupSuggestions.value = []
    else dropoffSuggestions.value = []
    return
  }

  try {
    const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
      params: {
        q: query,
        key: GEOCODING_API_KEY,
        limit: 5,
      },
    })

    const suggestions = response.data.results.map((result) => ({
      name: result.formatted,
      lat: result.geometry.lat,
      lng: result.geometry.lng,
    }))

    if (type === 'pickup') pickupSuggestions.value = suggestions
    else dropoffSuggestions.value = suggestions
  } catch (error) {
    console.error('Error fetching suggestions:', error)
  }
}

// Handle selection of a suggestion
const selectSuggestion = (suggestion, type) => {
  if (type === 'pickup') {
    pickup.value = { lat: suggestion.lat, lng: suggestion.lng }
    bookingForm.value.pickupAddress = suggestion.name
    pickupSuggestions.value = []
  } else {
    dropoff.value = { lat: suggestion.lat, lng: suggestion.lng }
    bookingForm.value.dropoffAddress = suggestion.name
    dropoffSuggestions.value = []
    calculateDistanceAndPrice()
  }
}

// Location data
const pickup = ref({ lat: null, lng: null })
const dropoff = ref({ lat: null, lng: null })

// Route points for drawing the line between pickup and dropoff
const routePoints = computed(() => {
  if (pickup.value.lat && dropoff.value.lat) {
    return [
      [pickup.value.lat, pickup.value.lng],
      [dropoff.value.lat, dropoff.value.lng],
    ]
  }
  return []
})

// Booking form
const bookingForm = ref({
  pickupAddress: '',
  dropoffAddress: '',
  distance: '',
  price: '',
  notes: '',
})

// Calculate if booking can be made
const canBook = computed(() => {
  return pickup.value.lat && dropoff.value.lat && bookingForm.value.distance
})

// Handle map clicks for setting locations
const handleMapClick = (event) => {
  const { lat, lng } = event.latlng

  // If pickup is not set, set pickup
  if (!pickup.value.lat) {
    pickup.value = { lat, lng }
    bookingForm.value.pickupAddress = `Pickup at ${lat.toFixed(6)}, ${lng.toFixed(6)}`
    // In a real app, you would use reverse geocoding to get the address
  }
  // If pickup is set but dropoff is not, set dropoff
  else if (!dropoff.value.lat) {
    dropoff.value = { lat, lng }
    bookingForm.value.dropoffAddress = `Dropoff at ${lat.toFixed(6)}, ${lng.toFixed(6)}`
    // Calculate distance and price
    calculateDistanceAndPrice()
  }
  // If both are set, reset and set pickup
  else {
    pickup.value = { lat, lng }
    dropoff.value = { lat: null, lng: null }
    bookingForm.value.pickupAddress = `Pickup at ${lat.toFixed(6)}, ${lng.toFixed(6)}`
    bookingForm.value.dropoffAddress = ''
    bookingForm.value.distance = ''
    bookingForm.value.price = ''
  }
}

// Calculate distance and price based on the two points
const calculateDistanceAndPrice = () => {
  if (pickup.value.lat && dropoff.value.lat) {
    const distance = calculateHaversineDistance(
      pickup.value.lat,
      pickup.value.lng,
      dropoff.value.lat,
      dropoff.value.lng,
    )

    bookingForm.value.distance = distance.toFixed(2)
    // Simple price calculation in pesos - ₱100 base + ₱75 per km
    const price = 100 + distance * 75
    bookingForm.value.price = price.toFixed(2)
  }
}

// Calculate distance between two points using the Haversine formula
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in km
  return distance
}

const deg2rad = (deg) => {
  return deg * (Math.PI / 180)
}

// Reverse geocode coordinates to get the place name
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
      params: {
        q: `${lat},${lng}`,
        key: GEOCODING_API_KEY,
      },
    })

    if (response.data.results.length > 0) {
      return response.data.results[0].formatted // Return the formatted address
    } else {
      return `Unknown Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`
    }
  } catch (error) {
    console.error('Error during reverse geocoding:', error)
    return `Unknown Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`
  }
}

// Submit booking
const submitBooking = async () => {
  loading.value = true

  try {
    // In a real app, send booking details to your backend
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate a booking reference (in a real app this would come from the backend)
    bookingReference.value = 'BK' + Math.floor(100000 + Math.random() * 900000)

    // Show success dialog
    bookingComplete.value = true

    // Reset form
    resetForm()
  } catch (error) {
    console.error('Booking failed:', error)
    alert('Failed to create booking. Please try again.')
  } finally {
    loading.value = false
  }
}

// Reset the form after booking
const resetForm = () => {
  pickup.value = { lat: null, lng: null }
  dropoff.value = { lat: null, lng: null }
  bookingForm.value = {
    pickupAddress: '',
    dropoffAddress: '',
    distance: '',
    price: '',
    notes: '',
  }
}

// Navigate to booking history
const viewBookingHistory = () => {
  bookingComplete.value = false
  router.push('/history')
}

// Get user's current location when component mounts
onMounted(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        center.value = [latitude, longitude]
      },
      (error) => {
        console.error('Error getting location:', error)
      },
    )
  }
})

// Set pickup location to user's current location
const setPickupToCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        pickup.value = { lat: latitude, lng: longitude }
        const placeName = await reverseGeocode(latitude, longitude)
        bookingForm.value.pickupAddress = placeName
        pickupSuggestions.value = []
      },
      (error) => {
        console.error('Error getting current location:', error)
        alert('Unable to fetch your current location. Please try again.')
      },
    )
  } else {
    alert('Geolocation is not supported by your browser.')
  }
}

const colors = ['indigo', 'warning', 'pink darken-2']
const slides = ['/public/images/c10.png', '/public/images/c16.png']
import { useDisplay } from 'vuetify'
const { mobile } = useDisplay()
</script>

<template>
  <DashboardLayout>
    <template #content>
      <v-row>
        <v-col :cols="mobile ? 12 : 8" class="mx-auto">
          <v-carousel
            :height="mobile ? '200' : '300'"
            show-arrows="hover"
            cycle
            hide-delimiter-background
          >
            <v-carousel-item v-for="(slide, i) in slides" :key="i">
              <v-sheet :color="colors[i]" height="100%">
                <div class="d-flex fill-height justify-center align-center">
                  <v-img
                    :src="slide"
                    alt="Slide Image"
                    :height="mobile ? '200' : '300'"
                    cover
                  ></v-img>
                </div>
              </v-sheet>
            </v-carousel-item>
          </v-carousel>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="8">
          <v-card class="mb-4">
            <v-card-title>Select Pickup and Drop-off Locations</v-card-title>
            <v-card-text>
              <div style="height: 500px; width: 100%">
                <l-map ref="map" v-model:zoom="zoom" :center="center" @click="handleMapClick">
                  <l-tile-layer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    layer-type="base"
                    name="OpenStreetMap"
                  ></l-tile-layer>

                  <!-- Pickup Marker -->
                  <l-marker v-if="pickup.lat" :lat-lng="[pickup.lat, pickup.lng]">
                    <l-popup>Pickup Location</l-popup>
                    <l-icon
                      :icon-url="pickupIcon"
                      :icon-size="[25, 41]"
                      :icon-anchor="[12, 41]"
                    ></l-icon>
                  </l-marker>

                  <!-- Dropoff Marker -->
                  <l-marker v-if="dropoff.lat" :lat-lng="[dropoff.lat, dropoff.lng]">
                    <l-popup>Drop-off Location</l-popup>
                    <l-icon
                      :icon-url="dropoffIcon"
                      :icon-size="[25, 41]"
                      :icon-anchor="[12, 41]"
                    ></l-icon>
                  </l-marker>

                  <!-- Route line if both points are set -->
                  <l-polyline
                    v-if="pickup.lat && dropoff.lat"
                    :lat-lngs="routePoints"
                    color="blue"
                  ></l-polyline>
                </l-map>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>Booking Details</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="submitBooking">
                <!-- Pickup Address with Suggestions -->
                <v-text-field
                  v-model="bookingForm.pickupAddress"
                  label="Pickup Address"
                  variant="outlined"
                  class="mb-2"
                  @input="fetchSuggestions(bookingForm.pickupAddress, 'pickup')"
                ></v-text-field>
                <v-list v-if="pickupSuggestions.length" class="mb-2">
                  <v-list-item
                    v-for="(suggestion, index) in pickupSuggestions"
                    :key="index"
                    @click="selectSuggestion(suggestion, 'pickup')"
                  >
                    {{ suggestion.name }}
                  </v-list-item>
                </v-list>

                <!-- Button to set current location as pickup -->
                <v-btn color="primary" class="mb-4" block @click="setPickupToCurrentLocation">
                  Use Current Location
                </v-btn>

                <!-- Drop-off Address with Suggestions -->
                <v-text-field
                  v-model="bookingForm.dropoffAddress"
                  label="Drop-off Address"
                  variant="outlined"
                  class="mb-2"
                  @input="fetchSuggestions(bookingForm.dropoffAddress, 'dropoff')"
                ></v-text-field>
                <v-list v-if="dropoffSuggestions.length" class="mb-2">
                  <v-list-item
                    v-for="(suggestion, index) in dropoffSuggestions"
                    :key="index"
                    @click="selectSuggestion(suggestion, 'dropoff')"
                  >
                    {{ suggestion.name }}
                  </v-list-item>
                </v-list>

                <v-text-field
                  v-model="bookingForm.distance"
                  label="Estimated Distance"
                  readonly
                  suffix="km"
                  variant="outlined"
                  class="mb-2"
                ></v-text-field>

                <v-text-field
                  v-model="bookingForm.price"
                  label="Estimated Price"
                  readonly
                  prefix="₱"
                  variant="outlined"
                  class="mb-2"
                ></v-text-field>

                <v-textarea
                  v-model="bookingForm.notes"
                  label="Additional Notes"
                  variant="outlined"
                  rows="3"
                  class="mb-4"
                ></v-textarea>

                <v-btn type="submit" color="primary" block :disabled="!canBook" :loading="loading">
                  Book Now
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Success Dialog -->
      <v-dialog v-model="bookingComplete" max-width="500">
        <v-card>
          <v-card-title class="text-h5">Booking Confirmed!</v-card-title>
          <v-card-text>
            Your motorcycle ride has been successfully booked. A rider will be assigned shortly.
            <v-alert type="info" class="mt-4"> Booking Reference: {{ bookingReference }} </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="viewBookingHistory">View Booking History</v-btn>
            <v-btn color="secondary" @click="bookingComplete = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-row>
        <v-col cols="12" md="8">
          <v-card> </v-card>
        </v-col>
      </v-row>
    </template>
  </DashboardLayout>
</template>

<style scoped>
/* Import leaflet CSS in your main.js file */
</style>
