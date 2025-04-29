<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { LMap, LTileLayer, LMarker, LPopup, LIcon, LPolyline } from '@vue-leaflet/vue-leaflet'
import { useLocationStore } from '@/stores/locations'
import { OpenRouteService } from '@/utils/openrouteservice'
import 'leaflet/dist/leaflet.css'

// Vue location setup
import { useGeolocation } from '@vueuse/core'
import L from 'leaflet'
import DashboardLayout from '@/components/layout/dashboards/DashboardLayout.vue'
import { useAuthUserStore } from '@/stores/authUser' // Import useAuthUserStore

//location states
const locationStore = useLocationStore()
const currentPosition = useGeolocation()
const destinationCoords = ref(null)

//
const initMap = () => {
  if (!map.value) {
    map.value = L.map('map').setView(
      [currentPosition.latitude.value, currentPosition.longitude.value],
      13,
    )

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map.value)
  }
}

const generateRoute = async () => {
  if (!destinationCoords.value) return

  const start = [currentPosition.longitude.value, currentPosition.latitude.value]
  const end = [destinationCoords.value.lng, destinationCoords.value.lat]

  try {
    const response = await OpenRouteService.getRoute(start, end)
    const routeGeoJSON = L.geoJSON(response.routes[0].geometry, {
      style: { color: 'blue', weight: 4 },
    })

    if (routeLayer.value) {
      map.value.removeLayer(routeLayer.value)
    }

    routeLayer.value = routeGeoJSON.addTo(map.value)
    map.value.fitBounds(routeGeoJSON.getBounds())
  } catch (error) {
    console.error('Error generating route:', error)
  }
}

// Run this whenever the destination changes
watch(destinationCoords, () => {
  if (destinationCoords.value) {
    generateRoute()
  }
})

onMounted(async () => {
  initMap()

  // Ensure user session is loaded before checking login status
  const authUserStore = useAuthUserStore()
  await authUserStore.isAuthenticated()

  if (locationStore.isLoggedIn) {
    locationStore.fetchLocations()
  } else {
    console.warn('User not logged in. Skipping fetchLocations.')
  }
})

// Geolocation hooks
const {
  coords,
  locatedAt,
  error: geoError,
  resume,
  pause,
} = useGeolocation({
  enableHighAccuracy: true,
})

// Fix for Leaflet marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const slides = [
  {
    image: '/public/images/c10.png',
    title: 'Fast & Reliable Service',
    description: 'Get to your destination on time, every time',
  },
  {
    image: '/public/images/c16.png',
    title: 'Affordable Rides',
    description: "Quality transportation that won't break the bank",
  },
  {
    image: '/public/images/c10.png',
    title: 'Safe Journeys',
    description: 'Your safety is our top priority',
  },
]

import { useDisplay } from 'vuetify'
const { mobile } = useDisplay()

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const router = useRouter()
const map = ref(null)
const zoom = ref(15)
const center = ref([8.948056, 125.543056]) // Default center (Philippines)
const loading = ref(false)
const bookingComplete = ref(false)
const bookingReference = ref('')

// Route data
const routeLoading = ref(false)
const routeError = ref(null)
const routePoints = ref([]) // This will hold the actual routing points
const routeDistance = ref(null)
const routeDuration = ref(null)
const routeLayer = ref(null)

// Icons for markers
const pickupIcon = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png'
const dropoffIcon = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png'
const currentLocationIcon = ref(null) // Will create a custom icon for current location

// OpenRouteService API key - replace with your own API key
const ORS_API_KEY = '5b3ce3597851110001cf6248c205cf9c26d84099907afd1e86c6766c'

// Create custom icon for current location
onMounted(() => {
  currentLocationIcon.value = L.divIcon({
    className: 'current-location-icon',
    html: '<div class="pulse"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
})

// API key for geocoding service
const GEOCODING_API_KEY = '1cdf6200a1854ae2bdb46779f9c9d1ab'

// Suggestions for pickup and dropoff
const pickupSuggestions = ref([])
const dropoffSuggestions = ref([])

// Live tracking toggle
const isTracking = ref(false)

// Start tracking user location
const startTracking = () => {
  isTracking.value = true
  resume()
}

// Stop tracking user location
const stopTracking = () => {
  isTracking.value = false
  pause()
}

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
        bound: '4.2158,116.7494,21.3210,126.5990',
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

    // If dropoff is already set, calculate route
    if (dropoff.value.lat) {
      calculateRoute()
    }
  } else {
    dropoff.value = { lat: suggestion.lat, lng: suggestion.lng }
    bookingForm.value.dropoffAddress = suggestion.name
    dropoffSuggestions.value = []

    // If pickup is already set, calculate route
    if (pickup.value.lat) {
      calculateRoute()
    }
  }
}

// Location data
const pickup = ref({ lat: null, lng: null })
const dropoff = ref({ lat: null, lng: null })

// Computed property for user's current location
const userLocation = computed(() => {
  if (coords.value.latitude && coords.value.longitude) {
    return [coords.value.latitude, coords.value.longitude]
  }
  return null
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
  return (
    pickup.value.lat && dropoff.value.lat && bookingForm.value.distance && isWithinPhilippines.value
  )
})

// Handle map clicks for setting locations
const handleMapClick = (event) => {
  const { lat, lng } = event.latlng

  // Check if the selected location is within the Philippines
  if (lat < 4.2158 || lat > 21.321 || lng < 116.7494 || lng > 126.599) {
    alert('Selected location is outside the Philippines. Please select a valid location.')
    return
  }

  // If pickup is not set, set pickup
  if (!pickup.value.lat) {
    pickup.value = { lat, lng }
    reverseGeocode(lat, lng).then((address) => {
      bookingForm.value.pickupAddress = address
      // Store the pickup location in locationStore
      locationStore.addLocation({
        latitude_a: lat,
        longitude_a: lng,
        latitude_b: null,
        longitude_b: null,
      })
    })
  }
  // If pickup is set but dropoff is not, set dropoff
  else if (!dropoff.value.lat) {
    dropoff.value = { lat, lng }
    reverseGeocode(lat, lng).then((address) => {
      bookingForm.value.dropoffAddress = address
      // Store the dropoff location in locationStore
      locationStore.addLocation({
        latitude_a: pickup.value.lat,
        longitude_a: pickup.value.lng,
        latitude_b: lat,
        longitude_b: lng,
      })
      calculateRoute()
    })
  }
  // If both are set, reset and set pickup
  else {
    pickup.value = { lat, lng }
    dropoff.value = { lat: null, lng: null }
    reverseGeocode(lat, lng).then((address) => {
      bookingForm.value.pickupAddress = address
      // Store the reset pickup location in locationStore
      locationStore.addLocation({
        latitude_a: lat,
        longitude_a: lng,
        latitude_b: null,
        longitude_b: null,
      })
    })
    bookingForm.value.dropoffAddress = ''
    bookingForm.value.distance = ''
    bookingForm.value.price = ''
    routePoints.value = []
    routeDistance.value = null
    routeDuration.value = null
  }
}

/// set within  Ph
const isWithinPhilippines = computed(() => {
  const { lat, lng } = pickup.value
  return lat >= 4.2158 && lat <= 21.321 && lng >= 116.7494 && lng <= 126.599
})

// Get directions from OpenRouteService
const calculateRoute = async () => {
  if (!pickup.value.lat || !dropoff.value.lat) return

  routeLoading.value = true
  routeError.value = null

  try {
    // Request directions from OpenRouteService
    const response = await axios.post(
      `https://api.openrouteservice.org/v2/directions/driving-car/geojson`,
      {
        coordinates: [
          [pickup.value.lng, pickup.value.lat], // Note: ORS uses [longitude, latitude] order
          [dropoff.value.lng, dropoff.value.lat],
        ],
      },
      {
        headers: {
          Authorization: ORS_API_KEY,
          'Content-Type': 'application/json',
        },
      },
    )

    // Extract the route points
    const coordinates = response.data.features[0].geometry.coordinates

    // Convert [lng, lat] to [lat, lng] format for Leaflet
    routePoints.value = coordinates.map((point) => [point[1], point[0]])

    // Extract route information
    const summary = response.data.features[0].properties.summary
    routeDistance.value = (summary.distance / 1000).toFixed(2) // Convert to km
    routeDuration.value = Math.round(summary.duration / 60) // Convert to minutes

    // Update booking form
    bookingForm.value.distance = routeDistance.value
    // Calculate price - ₱100 base + ₱75 per km
    const price = 30 + parseFloat(routeDistance.value) * 12
    bookingForm.value.price = price.toFixed(2)
  } catch (error) {
    console.error('Error calculating route:', error)
    routeError.value = 'Unable to calculate route. Please try different locations.'

    // Fallback to direct distance calculation
    calculateDirectDistance()
  } finally {
    routeLoading.value = false
  }
}

// Fallback to direct distance if routing fails
const calculateDirectDistance = () => {
  if (pickup.value.lat && dropoff.value.lat) {
    const distance = calculateHaversineDistance(
      pickup.value.lat,
      pickup.value.lng,
      dropoff.value.lat,
      dropoff.value.lng,
    )

    bookingForm.value.distance = distance.toFixed(2)
    // Simple price calculation in pesos - ₱100 base + ₱75 per km
    const price = 30 + distance * 12
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
  routePoints.value = []
  routeDistance.value = null
  routeDuration.value = null
}

// Navigate to booking history
const viewBookingHistory = () => {
  bookingComplete.value = false
  router.push('/history')
}

// Watch for changes in user location and update center if tracking is enabled
watch(coords, () => {
  if (isTracking.value && coords.value.latitude && coords.value.longitude) {
    center.value = [coords.value.latitude, coords.value.longitude]

    // If map ref is available, update the view
    if (map.value?.leafletObject) {
      map.value.leafletObject.setView(center.value, zoom.value)
    }
  }
})

// Set pickup location to user's current location using VueUse's geolocation
const setPickupToCurrentLocation = async () => {
  if (coords.value.latitude && coords.value.longitude) {
    pickup.value = { lat: coords.value.latitude, lng: coords.value.longitude }
    center.value = [coords.value.latitude, coords.value.longitude]

    const placeName = await reverseGeocode(coords.value.latitude, coords.value.longitude)
    bookingForm.value.pickupAddress = placeName
    pickupSuggestions.value = []

    // If dropoff is set, calculate route
    if (dropoff.value.lat) {
      calculateRoute()
    }
  } else {
    // Start geolocation if not already active
    resume()
    alert('Getting your location... Please try again in a moment.')
  }
}

// Function to center map on user's current location
const centerOnUserLocation = () => {
  if (coords.value.latitude && coords.value.longitude) {
    center.value = [coords.value.latitude, coords.value.longitude]
  } else {
    resume()
    alert('Getting your location... Please try again in a moment.')
  }
}

// Initialize geolocation on component mount
onMounted(() => {
  // Start tracking on mount
  resume()

  // When coordinates are available, set the map center
  if (coords.value.latitude && coords.value.longitude) {
    center.value = [coords.value.latitude, coords.value.longitude]
  }
})

// Computed property for responsive height
const carouselHeight = computed(() => {
  if (mobile.value) return '200'
  return '400'
})
</script>

<template>
  <DashboardLayout>
    <template #content>
      <v-row class="mt-5">
        <v-col :cols="mobile ? 12 : 10" class="mx-auto">
          <v-carousel
            :height="carouselHeight"
            show-arrows="hover"
            cycle
            hide-delimiter-background
            interval="5000"
            progress="primary"
          >
            <v-carousel-item v-for="(slide, i) in slides" :key="i" :src="slide.image" cover>
              <div class="carousel-gradient d-flex flex-column justify-end align-start pa-6">
                <h2 class="text-white text-h3 font-weight-bold">{{ slide.title }}</h2>
                <p class="text-white text-subtitle-1 mt-2">{{ slide.description }}</p>
              </div>
            </v-carousel-item>
          </v-carousel>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="8">
          <v-card class="mb-4">
            <v-card-title>Select Pickup and Drop-off Locations</v-card-title>
            <v-card-subtitle v-if="geoError" class="text-error">
              Geolocation error: {{ geoError }}
            </v-card-subtitle>
            <v-card-subtitle v-if="routeError" class="text-error">
              {{ routeError }}
            </v-card-subtitle>
            <v-card-text>
              <div class="d-flex mb-2">
                <v-btn color="purple-lighten-2" class="mr-2" @click="centerOnUserLocation">
                  <v-icon left>mdi-crosshairs-gps</v-icon>
                  Find Me
                </v-btn>
                <v-btn
                  :color="isTracking ? 'error' : 'success'"
                  @click="isTracking ? stopTracking() : startTracking()"
                >
                  <v-icon left>{{ isTracking ? 'mdi-stop' : 'mdi-play' }}</v-icon>
                  {{ isTracking ? 'Stop Tracking' : 'Start Tracking' }}
                </v-btn>
              </div>

              <div style="height: 500px; width: 100%">
                <l-map ref="map" v-model:zoom="zoom" :center="center" @click="handleMapClick">
                  <l-tile-layer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    layer-type="base"
                    name="OpenStreetMap"
                  ></l-tile-layer>

                  <!-- Current Location Marker -->
                  <l-marker v-if="userLocation" :lat-lng="userLocation" :icon="currentLocationIcon">
                    <l-popup>Your Current Location</l-popup>
                  </l-marker>

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

                  <!-- Route line following roads -->
                  <l-polyline
                    v-if="routePoints.length > 0"
                    :lat-lngs="routePoints"
                    color="blue"
                    :weight="5"
                    :opacity="0.7"
                  ></l-polyline>
                </l-map>
              </div>

              <v-overlay absolute :value="routeLoading" class="text-center">
                <v-progress-circular indeterminate size="64"></v-progress-circular>
                <div class="mt-4">Calculating route...</div>
              </v-overlay>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>Booking Details</v-card-title>
            <v-card-text>
              <!-- Loader overlay -->
              <v-overlay absolute :value="loading" class="text-center">
                <v-progress-circular indeterminate size="64"></v-progress-circular>
                <div class="mt-4">Loading...</div>
              </v-overlay>
              <!-- Booking form -->
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
                <v-btn
                  color="purple-darken-3"
                  class="mb-4"
                  block
                  @click="setPickupToCurrentLocation"
                  :disabled="!coords.latitude"
                >
                  <v-icon left>mdi-crosshairs-gps</v-icon>
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

                <div v-if="routeDuration" class="mb-2 text-subtitle-1">
                  Estimated travel time: {{ routeDuration }} minutes
                </div>

                <v-textarea
                  v-model="bookingForm.notes"
                  label="Additional Notes"
                  variant="outlined"
                  rows="3"
                  class="mb-4"
                ></v-textarea>

                <v-btn
                  type="submit"
                  color="purple-darken-3"
                  block
                  :disabled="!canBook"
                  :loading="loading"
                >
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
    </template>
  </DashboardLayout>
</template>

<style scoped>
/* Create a pulsing effect for current location marker */
.current-location-icon {
  position: relative;
}

.pulse {
  width: 16px;
  height: 16px;
  background-color: #2196f3;
  border-radius: 50%;
  position: relative;
}

.pulse:before {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 2px solid #2196f3;
  border-radius: 50%;
  animation: pulse 1.5s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.carousel-gradient {
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0) 100%
  );
  height: 100%;
  width: 100%;
}
</style>
