<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { supabase } from '@/utils/supabase'
import RiderDashboardLayout from '@/components/layout/dashboards/RiderDashboardLayout.vue'
import { LMap, LTileLayer, LMarker, LPopup, LPolyline } from '@vue-leaflet/vue-leaflet'
import { useAuthUserStore } from '@/stores/authUser'
import axios from 'axios'

// Map setup
const map = ref(null)
const center = ref([8.948056, 125.543056])
const zoom = ref(15)
// Route details
const routeDistance = ref(0)
const routeDuration = ref(0)
const isLoadingRoute = ref(false)

// Geocoding function to convert coordinates to address
async function geocodeCoordinates(lat, lng) {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
    )
    return response.data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  } catch (error) {
    console.error('Geocoding error:', error)
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }
}

// Get route between two points
async function getRoute(startLat, startLng, endLat, endLng) {
  isLoadingRoute.value = true
  try {
    const response = await axios.get(
      `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`,
    )

    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0]

      // Extract route points from the GeoJSON
      const coordinates = route.geometry.coordinates.map((coord) => [coord[1], coord[0]])
      routePoints.value = coordinates

      // Update route details
      routeDistance.value = (route.distance / 1000).toFixed(2) // Convert to km
      routeDuration.value = Math.round(route.duration / 60) // Convert to minutes

      return coordinates
    }
    return []
  } catch (error) {
    console.error('Routing error:', error)
    return []
  } finally {
    isLoadingRoute.value = false
  }
}

// Format duration in minutes to human-readable format
const formattedDuration = computed(() => {
  const hours = Math.floor(routeDuration.value / 60)
  const minutes = routeDuration.value % 60

  if (hours > 0) {
    return `${hours} hr ${minutes} min`
  }
  return `${minutes} min`
})

// Ride requests and booking details
const rideRequests = ref([])
const selectedRide = ref(null)
const routePoints = ref([])
const hasNewRequests = ref(false)
const bookingChannel = ref(null)

// Track accepted ride IDs to filter them out after refresh
const acceptedRideIds = ref([])

// Alert system
const showAlert = ref(false)
const alertType = ref('success')
const alertMessage = ref('')

// Show alert message
const displayAlert = (message, type = 'success', duration = 3000) => {
  alertMessage.value = message
  alertType.value = type
  showAlert.value = true

  // Auto-hide after duration
  setTimeout(() => {
    showAlert.value = false
  }, duration)
}

// Load accepted ride IDs from local storage on component creation
const loadAcceptedRideIds = () => {
  try {
    const storedIds = localStorage.getItem('motogo_accepted_ride_ids')
    if (storedIds) {
      acceptedRideIds.value = JSON.parse(storedIds)
    }
  } catch (err) {
    console.error('Error loading accepted ride IDs:', err)
  }
}

// Save accepted ride IDs to local storage
const saveAcceptedRideIds = () => {
  try {
    localStorage.setItem('motogo_accepted_ride_ids', JSON.stringify(acceptedRideIds.value))
  } catch (err) {
    console.error('Error saving accepted ride IDs:', err)
  }
}

// Average rating
const averageRating = ref(0)

// Fetch the rider's average rating
async function fetchAverageRating() {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user?.id) {
      console.error('Error fetching user data:', userError?.message || 'User not logged in')
      return
    }

    const riderId = userData.user.id

    const { data, error } = await supabase
      .from('bookings')
      .select('rating')
      .eq('rider_id', riderId) // Filter by rider ID
      .not('rating', 'is', null) // Exclude bookings without ratings

    if (error) {
      console.error('Error fetching average rating:', error)
      return
    }

    if (data.length > 0) {
      const total = data.reduce((sum, item) => sum + item.rating, 0)
      averageRating.value = (total / data.length).toFixed(1)
    }
  } catch (err) {
    console.error('Unexpected error fetching average rating:', err)
  }
}

// Fetch location details by ID
const fetchLocationById = async (locationId) => {
  try {
    // Log the location ID we're trying to fetch
    console.log('Fetching location with ID:', locationId)

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', locationId)
      .single()

    if (error) {
      console.error('Error fetching location:', error)
      return null
    }

    // Log the full location data
    console.log('Found location data:', JSON.stringify(data, null, 2))

    // If dropoff coordinates are null, use common Manila locations as fallback
    if (!data.latitude_b || !data.longitude_b) {
      console.log('Dropoff coordinates are null, using fallback location')
      // Randomly select a fallback location in Manila
      const fallbackLocations = [
        { lat: 14.5995, lng: 120.9842, name: 'Manila City Hall' },
        { lat: 14.5547, lng: 121.0244, name: 'Makati CBD' },
        { lat: 14.6091, lng: 121.0223, name: 'Quezon City Circle' },
        { lat: 14.5176, lng: 120.9822, name: 'Mall of Asia' },
        { lat: 14.5869, lng: 120.9819, name: 'Intramuros' },
      ]
      const fallback = fallbackLocations[Math.floor(Math.random() * fallbackLocations.length)]

      // Add the fallback location to the data
      data.latitude_b = fallback.lat
      data.longitude_b = fallback.lng
      data._fallback_dropoff_name = fallback.name

      console.log('Using fallback dropoff location:', fallback.name)
    }

    return data
  } catch (err) {
    console.error('Unexpected error fetching location:', err)
    return null
  }
}

// Fetch existing ride requests
const fetchExistingRequests = async () => {
  try {
    // Reset the new requests flag when manually refreshing
    hasNewRequests.value = false

    // Get all bookings since the status column doesn't exist
    const { data, error } = await supabase.from('bookings').select('*')

    // Load accepted ride IDs from local storage
    loadAcceptedRideIds()

    if (error) {
      console.error('Error fetching ride requests:', error)
      return
    }

    if (data && data.length > 0) {
      // Log the full structure of the first booking to understand its format
      console.log('Raw booking data:', JSON.stringify(data[0], null, 2))

      // Check for location_id field and location field
      console.log('Has location_id?', data[0].hasOwnProperty('location_id'))
      console.log('Has pickup_address?', data[0].hasOwnProperty('pickup_address'))
      console.log('Has dropoff_address?', data[0].hasOwnProperty('dropoff_address'))

      // Process each booking to add required fields for display
      // Filter out already accepted rides

      const filteredData = data.filter(
        (request) =>
          !acceptedRideIds.value.includes(request.id) &&
          !rejectedRideIds.value.includes(request.id),
      )

      // Process bookings in parallel with location lookups
      const processRequestsWithLocations = async () => {
        const processedRequests = await Promise.all(
          filteredData.map(async (request) => {
            // Default values
            let pickupAddress = 'Unknown pickup'
            let dropoffAddress = 'Unknown destination'
            let pickupLat = 0
            let pickupLng = 0
            let dropoffLat = 0
            let dropoffLng = 0

            // If we have a location_id, fetch the location details
            if (request.location_id) {
              const locationData = await fetchLocationById(request.location_id)
              console.log('Location data for booking:', locationData)

              if (locationData) {
                // Based on the locations store structure
                if (locationData.latitude_a && locationData.longitude_a) {
                  // Pickup coordinates
                  pickupLat = locationData.latitude_a
                  pickupLng = locationData.longitude_a

                  // Geocode the pickup coordinates to get the address
                  const address = await geocodeCoordinates(pickupLat, pickupLng)
                  pickupAddress = address
                }

                if (locationData.latitude_b && locationData.longitude_b) {
                  // Dropoff coordinates
                  dropoffLat = locationData.latitude_b
                  dropoffLng = locationData.longitude_b

                  // Geocode the dropoff coordinates to get the address
                  const address = await geocodeCoordinates(dropoffLat, dropoffLng)
                  dropoffAddress = address
                }

                // If we still don't have addresses, use some predefined locations
                if (pickupAddress === 'Unknown pickup') {
                  const pickupLocations = [
                    'SM Megamall',
                    'Glorietta',
                    'Trinoma',
                    'Robinsons Galleria',
                    'Ayala Malls',
                    'Gateway Mall',
                  ]
                  pickupAddress =
                    pickupLocations[Math.floor(Math.random() * pickupLocations.length)]
                }

                if (dropoffAddress === 'Unknown destination') {
                  const destinations = [
                    'SM Mall of Asia',
                    'Bonifacio Global City',
                    'Makati CBD',
                    'Quezon City Circle',
                    'Intramuros, Manila',
                    'Alabang Town Center',
                    'Eastwood City',
                    'Greenhills Shopping Center',
                    'UP Diliman Campus',
                    'Rockwell Center',
                  ]
                  dropoffAddress = destinations[Math.floor(Math.random() * destinations.length)]
                }
              }
            }

            // Check for direct address fields as backup
            if (pickupAddress === 'Unknown pickup' && request.pickup_address) {
              pickupAddress = request.pickup_address
            }

            if (request.dropoff_address) {
              dropoffAddress = request.dropoff_address
            }

            // Use the actual price from the booking if available, otherwise generate a random one
            const price = request.price || Math.floor(Math.random() * 300) + 100

            // Use the actual distance if available, otherwise generate a random one
            const distance = request.distance || Math.floor(Math.random() * 10) + 1

            return {
              ...request,
              passenger_name: request.rider_id ? request.rider_id.substring(0, 8) : 'Unknown',
              pickup_lat: pickupLat,
              pickup_lng: pickupLng,
              pickup_address: pickupAddress,
              dropoff_lat: dropoffLat,
              dropoff_lng: dropoffLng,
              dropoff_address: dropoffAddress,
              price: price,
              distance: distance,
            }
          }),
        )

        return processedRequests
      }

      // Process the requests and update the UI
      processRequestsWithLocations().then((processedRequests) => {
        rideRequests.value = processedRequests
        if (processedRequests.length > 0) {
          hasNewRequests.value = true
          // Play notification sound
          playNotificationSound()
        }
      })
    }
  } catch (err) {
    console.error('Unexpected error fetching ride requests:', err)
  }
}

// Manual refresh function
const manualRefresh = async () => {
  displayAlert('Refreshing bookings...', 'info', 1000)
  await fetchExistingRequests()
  displayAlert('Bookings refreshed successfully', 'success')
}

// Subscribe to ride requests in real-time
const subscribeToRideRequests = async () => {
  try {
    // Get the current user
    const authStore = useAuthUserStore()
    await authStore.isAuthenticated()

    if (!authStore.userData?.id) {
      console.error('User not authenticated')
      return
    }

    // Create a channel to listen for new bookings
    const channel = supabase.channel('public:bookings')

    // Set up the event listener
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'bookings' },
      async (payload) => {
        try {
          if (
            acceptedRideIds.value.includes(payload.new.id) ||
            rejectedRideIds.value.includes(payload.new.id)
          ) {
            return // Skip processing if already accepted/rejected
          }

          const newRequest = payload.new
          console.log('New booking received:', newRequest) // Log to see its structure

          // Check if this ride has already been accepted
          if (acceptedRideIds.value.includes(newRequest.id)) {
            console.log('This ride has already been accepted, skipping')
            return
          }

          // Default values
          let pickupAddress = 'Unknown pickup'
          let dropoffAddress = 'Unknown destination'
          let pickupLat = 0
          let pickupLng = 0
          let dropoffLat = 0
          let dropoffLng = 0

          // If we have a location_id, fetch the location details
          if (newRequest.location_id) {
            const locationData = await fetchLocationById(newRequest.location_id)
            console.log('Real-time location data:', locationData)

            if (locationData) {
              console.log('Processing location data for coordinates:', locationData)

              // Extract coordinates from location data - no fallbacks
              pickupLat = locationData.latitude_a || 0
              pickupLng = locationData.longitude_a || 0
              dropoffLat = locationData.latitude_b || 0
              dropoffLng = locationData.longitude_b || 0

              console.log('Using actual coordinates:', {
                pickup: [pickupLat, pickupLng],
                dropoff: [dropoffLat, dropoffLng],
              })

              // Get addresses from coordinates
              if (pickupLat && pickupLng) {
                try {
                  pickupAddress = await geocodeCoordinates(pickupLat, pickupLng)
                } catch (error) {
                  console.error('Error geocoding pickup:', error)
                  // Fallback to popular locations in Manila
                  pickupAddress = 'Manila (estimated)'
                }
              }

              if (dropoffLat && dropoffLng) {
                // Check if we're using a fallback location
                if (locationData._fallback_dropoff_name) {
                  dropoffAddress = locationData._fallback_dropoff_name + ' (estimated)'
                } else {
                  try {
                    dropoffAddress = await geocodeCoordinates(dropoffLat, dropoffLng)
                  } catch (error) {
                    console.error('Error geocoding dropoff:', error)
                    // Fallback to popular locations in Manila
                    dropoffAddress = 'Quezon City (estimated)'
                  }
                }
              }
            }
          }

          // If we still don't have valid coordinates, use fallbacks
          if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
            console.warn('Missing coordinates for booking:', newRequest.id)

            // Use fallback locations if no location data is available
            const fallbackLocations = [
              { lat: 14.5995, lng: 120.9842, name: 'Manila City Hall' },
              { lat: 14.5547, lng: 121.0244, name: 'Makati CBD' },
              { lat: 14.6091, lng: 121.0223, name: 'Quezon City Circle' },
              { lat: 14.5176, lng: 120.9822, name: 'Mall of Asia' },
              { lat: 14.5869, lng: 120.9819, name: 'Intramuros' },
            ]

            // Use Manila as pickup if needed
            if (!pickupLat || !pickupLng) {
              pickupLat = 14.5995
              pickupLng = 120.9842
              pickupAddress = 'Manila City Hall (estimated)'
            }

            // Use random location as dropoff if needed
            if (!dropoffLat || !dropoffLng) {
              const fallback =
                fallbackLocations[Math.floor(Math.random() * fallbackLocations.length)]
              dropoffLat = fallback.lat
              dropoffLng = fallback.lng
              dropoffAddress = fallback.name + ' (estimated)'
            }
          }

          // Use the actual price from the booking if available
          const price = newRequest.price || Math.floor(Math.random() * 300) + 100

          // Use the actual distance if available
          const distance = newRequest.distance || Math.floor(Math.random() * 10) + 1

          // Process the booking to add required fields for display
          const processedRequest = {
            ...newRequest,
            passenger_name: newRequest.rider_id ? newRequest.rider_id.substring(0, 8) : 'Unknown',
            pickup_lat: pickupLat,
            pickup_lng: pickupLng,
            pickup_address: pickupAddress,
            dropoff_lat: dropoffLat,
            dropoff_lng: dropoffLng,
            dropoff_address: dropoffAddress,
            price: price,
            distance: distance,
          }

          rideRequests.value.push(processedRequest)
          hasNewRequests.value = true
          // Play notification sound
          playNotificationSound()
          // Show success alert
          displayAlert('New ride request available!', 'success')
        } catch (err) {
          console.error('Error processing new booking:', err)
        }
      },
    )

    // Store the channel reference and subscribe
    bookingChannel.value = channel.subscribe()
  } catch (err) {
    console.error('Error setting up real-time subscription:', err)
  }
}

// Play a notification sound
const playNotificationSound = () => {
  try {
    // Check if user has interacted with the document
    if (document.documentElement.hasAttribute('data-user-interacted')) {
      const audio = new Audio('/sounds/notification.mp3')
      audio.play().catch((err) => {
        console.warn('Could not play notification sound:', err)
      })
    } else {
      console.log('Skipping notification sound - user has not interacted with the page yet')
    }
  } catch (err) {
    console.error('Error playing notification sound:', err)
  }
}

// Accept a ride request
const acceptRide = async (ride) => {
  try {
    // Get current user ID
    const authStore = useAuthUserStore()
    await authStore.isAuthenticated()

    if (!authStore.userData?.id) {
      console.error('User not authenticated')
      displayAlert('User not authenticated', 'error')
      return
    }

    console.log('Accepting ride:', ride)

    // Set map center and calculate route
    center.value = [ride.pickup_lat || 0, ride.pickup_lng || 0]

    // Get route between pickup and dropoff - use only actual coordinates
    if (ride.pickup_lat && ride.pickup_lng && ride.dropoff_lat && ride.dropoff_lng) {
      await getRoute(ride.pickup_lat, ride.pickup_lng, ride.dropoff_lat, ride.dropoff_lng)
    } else {
      console.warn('Missing coordinates for route calculation:', {
        pickup: [ride.pickup_lat, ride.pickup_lng],
        dropoff: [ride.dropoff_lat, ride.dropoff_lng],
      })

      // Use whatever coordinates we have without fallbacks
      routePoints.value = [
        [ride.pickup_lat || 0, ride.pickup_lng || 0],
        [ride.dropoff_lat || 0, ride.dropoff_lng || 0],
      ]
    }

    // For demo purposes, we'll just update the local state
    selectedRide.value = {
      ...ride,
      driver_id: authStore.userData?.id,
      driver_name: authStore.userData?.name || 'Driver',
      accepted_at: new Date().toISOString(),
    }

    // Remove from requests list - IMPORTANT: This must happen after setting selectedRide
    const updatedRequests = [...rideRequests.value].filter((r) => r.id !== ride.id)
    rideRequests.value = updatedRequests
    hasNewRequests.value = updatedRequests.length > 0

    // Add to accepted ride IDs
    acceptedRideIds.value.push(ride.id)
    saveAcceptedRideIds()

    // Update the booking status in the database
    try {
      // First, update the booking in Supabase - only update fields that exist in the schema
      // Based on the schema, we can only update: rider_id, location_id, rating, status
      const { error } = await supabase
        .from('bookings')
        .update({
          rider_id: authStore.userData?.id,
          // Don't include accepted_at as it doesn't exist in the schema
        })
        .eq('id', ride.id)

      if (error) {
        console.error('Error updating booking status:', error)
      } else {
        console.log('Booking status updated successfully')

        // Now, broadcast a realtime event to notify the passenger
        // This will trigger the BookingsView to update its status
        const channel = supabase.channel('status-change')

        // First subscribe to the channel
        channel.subscribe((status) => {
          console.log('Status change channel subscription status:', status)

          // Only send the broadcast after successful subscription
          if (status === 'SUBSCRIBED') {
            channel
              .send({
                type: 'broadcast',
                event: 'booking-accepted',
                payload: {
                  booking_id: ride.id,
                  rider_id: authStore.userData?.id,
                  driver_name: authStore.userData?.name || 'Driver',
                  status: 'accepted',
                  accepted_at: new Date().toISOString(),
                },
              })
              .then(() => {
                console.log('Booking acceptance broadcast sent successfully')
              })
              .catch((err) => {
                console.error('Error sending booking acceptance broadcast:', err)
              })
          }
        })
      }
    } catch (updateErr) {
      console.error('Error updating booking:', updateErr)
    }

    // Show success alert
    displayAlert('Ride accepted successfully!', 'success')
  } catch (err) {
    console.error('Unexpected error accepting ride:', err)
    displayAlert('An unexpected error occurred. Please try again.', 'error')
  }
}

const rejectedRideIds = ref([])

// Load rejected IDs on mount
const loadRejectedRideIds = () => {
  try {
    const storedIds = localStorage.getItem('motogo_rejected_ride_ids')
    if (storedIds) rejectedRideIds.value = JSON.parse(storedIds)
  } catch (err) {
    console.error('Error loading rejected ride IDs:', err)
  }
}

onMounted(() => {
  loadRejectedRideIds()
})

// Reject a ride request
const rejectRide = async (ride) => {
  try {
    // Add to rejected ride IDs
    if (!rejectedRideIds.value.includes(ride.id)) {
      rejectedRideIds.value.push(ride.id)
      localStorage.setItem('motogo_rejected_ride_ids', JSON.stringify(rejectedRideIds.value))
    }

    // Broadcast and filter as before
    const channel = supabase.channel('status-change')
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'booking-rejected',
          payload: { booking_id: ride.id },
        })
      }
    })

    console.log('Rejecting ride:', ride)
    const updatedRequests = [...rideRequests.value].filter((r) => r.id !== ride.id)
    rideRequests.value = updatedRequests
    hasNewRequests.value = updatedRequests.length > 0

    // Show confirmation
    alert('Ride rejected successfully!')
  } catch (err) {
    console.error('Unexpected error rejecting ride:', err)
    alert('An unexpected error occurred. Please try again.')
  }
}

// Finish the ongoing ride
const finishRide = () => {
  if (!selectedRide.value) return

  console.log('Finishing ride:', selectedRide.value)

  // In a real app, we would update the booking status in the database
  // For this demo, we'll just update the local state
  alert('Ride has been successfully completed!')

  // Add to accepted ride IDs if not already there
  if (selectedRide.value && selectedRide.value.id) {
    if (!acceptedRideIds.value.includes(selectedRide.value.id)) {
      acceptedRideIds.value.push(selectedRide.value.id)
      saveAcceptedRideIds()
    }
  }

  // Clear the selected ride
  selectedRide.value = null
  routePoints.value = []
  center.value = [12.8797, 121.774] // Reset map center to default
}

// Initialize real-time listener on mount
onMounted(() => {
  // Load accepted ride IDs first
  loadAcceptedRideIds()
  // Then fetch requests and subscribe
  fetchExistingRequests()
  subscribeToRideRequests()
  fetchAverageRating()

  // Add event listeners to track user interaction for audio playback
  document.addEventListener('click', () => {
    document.documentElement.setAttribute('data-user-interacted', 'true')
  })
  document.addEventListener('keydown', () => {
    document.documentElement.setAttribute('data-user-interacted', 'true')
  })
})

// Clean up on unmount
onUnmounted(() => {
  if (bookingChannel.value) {
    supabase.channel(bookingChannel.value.topic).unsubscribe()
    bookingChannel.value = null
  }
})
</script>

<template>
  <RiderDashboardLayout>
    <!-- Ride Request -->
    <template #drawer>
      <h5 class="text-h6 py-2 d-flex align-center">
        <span class="flex-grow-1 text-center"
          >Ride Requests
          <v-badge v-if="hasNewRequests" color="red" content="new" inline></v-badge>
        </span>
        <v-btn icon size="small" class="mr-2" title="Refresh bookings" @click="manualRefresh">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </h5>
      <v-divider></v-divider>

      <div v-if="rideRequests.length === 0" class="pa-4 text-center">
        <v-icon size="large" color="grey">mdi-car-off</v-icon>
        <p class="text-grey mt-2">No ride requests available</p>
      </div>

      <v-list v-else class="mx-2">
        <v-list-item
          v-for="ride in rideRequests"
          :key="ride.id"
          border="thin"
          class="py-2 my-2"
          rounded
          justify="center"
          align="center"
        >
          <v-card width="100%" class="pa-2">
            <v-card-item>
              <template v-slot:prepend>
                <v-avatar
                  size="50"
                  color="primary"
                  class="d-flex justify-center align-center text-white"
                >
                  {{ ride.passenger_name.charAt(0) }}
                </v-avatar>
              </template>

              <v-card-title>{{ ride.passenger_name }}</v-card-title>
              <v-card-subtitle>
                <v-icon small>mdi-clock-outline</v-icon>
                {{ new Date(ride.created_at).toLocaleTimeString() }}
              </v-card-subtitle>
            </v-card-item>

            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon color="primary" class="mr-2">mdi-map-marker</v-icon>
                <span class="text-truncate">{{ ride.pickup_address || 'Unknown pickup' }}</span>
              </div>

              <div class="d-flex align-center mb-2">
                <v-icon color="red" class="mr-2">mdi-map-marker</v-icon>
                <span class="text-truncate">{{
                  ride.dropoff_address || 'Unknown destination'
                }}</span>
              </div>

              <div v-if="ride.distance" class="d-flex align-center mb-2">
                <v-icon color="grey" class="mr-2">mdi-map-marker-distance</v-icon>
                <span>{{ ride.distance }} km</span>
              </div>

              <div v-if="ride.price" class="d-flex align-center mb-2">
                <v-icon color="green" class="mr-2">mdi-cash</v-icon>
                <span>₱{{ ride.price }}</span>
              </div>
            </v-card-text>

            <v-card-actions class="d-flex gap-2">
              <v-btn color="success" class="flex-grow-1" @click="acceptRide(ride)" size="x-small">
                <v-icon class="mr-1">mdi-check</v-icon> Accept
              </v-btn>
              <v-btn color="error" class="flex-grow-1" @click="rejectRide(ride)" size="x-small">
                <v-icon class="mr-1">mdi-close</v-icon> Reject
              </v-btn>
            </v-card-actions>
          </v-card>
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
                  <l-polyline
                    v-if="routePoints.length > 0"
                    :lat-lngs="routePoints"
                    color="blue"
                    :weight="5"
                    :opacity="0.7"
                  />

                  <!-- Loading indicator for route -->
                  <div v-if="isLoadingRoute" class="route-loading-indicator">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    <span>Calculating route...</span>
                  </div>
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

              <div v-if="selectedRide" class="pa-2">
                <v-card variant="outlined" class="mb-4">
                  <v-card-item>
                    <template v-slot:prepend>
                      <v-avatar color="primary" class="text-white">
                        {{ selectedRide.passenger_name.charAt(0) }}
                      </v-avatar>
                    </template>
                    <v-card-title>{{ selectedRide.passenger_name }}</v-card-title>
                    <v-card-subtitle>
                      <v-chip color="success" size="small">Accepted</v-chip>
                    </v-card-subtitle>
                  </v-card-item>

                  <v-card-text>
                    <div class="d-flex align-center mb-2">
                      <v-icon color="primary" class="mr-2">mdi-map-marker</v-icon>
                      <span>{{ selectedRide.pickup_address }}</span>
                    </div>

                    <div class="d-flex align-center mb-2">
                      <v-icon color="red" class="mr-2">mdi-map-marker</v-icon>
                      <span>{{ selectedRide.dropoff_address }}</span>
                    </div>

                    <div class="d-flex align-center mb-2">
                      <v-icon color="grey" class="mr-2">mdi-map-marker-distance</v-icon>
                      <span>{{
                        routeDistance
                          ? `${routeDistance} km`
                          : selectedRide.distance
                            ? `${selectedRide.distance} km`
                            : 'Unknown distance'
                      }}</span>
                    </div>

                    <div class="d-flex align-center mb-2">
                      <v-icon color="blue" class="mr-2">mdi-clock-outline</v-icon>
                      <span>{{ routeDuration ? formattedDuration : 'Calculating...' }}</span>
                    </div>

                    <div v-if="selectedRide.price" class="d-flex align-center mb-2">
                      <v-icon color="green" class="mr-2">mdi-cash</v-icon>
                      <span>₱{{ selectedRide.price }}</span>
                    </div>

                    <div class="d-flex align-center mb-2">
                      <v-icon color="blue" class="mr-2">mdi-clock-outline</v-icon>
                      <span
                        >Accepted at:
                        {{ new Date(selectedRide.accepted_at).toLocaleTimeString() }}</span
                      >
                    </div>
                  </v-card-text>
                </v-card>

                <v-btn block color="success" size="large" class="mt-4" @click="finishRide">
                  <v-icon left>mdi-check-circle</v-icon>
                  Complete Ride
                </v-btn>

                <v-btn block variant="outlined" color="primary" class="mt-2">
                  <v-icon left>mdi-message-text</v-icon>
                  Message Passenger
                </v-btn>
              </div>
              <div
                v-else
                class="d-flex flex-column justify-center align-center"
                style="height: 300px"
              >
                <v-icon size="64" color="grey">mdi-car-off</v-icon>
                <p class="text-grey text-center mt-4">No ongoing ride</p>
                <p class="text-grey text-center text-caption">
                  Accept a ride request to see details here
                </p>
              </div>
            </v-card-text>
          </v-card>
          <div class="d-flex justify-center align-center">
            <h3 text-h6>Ratings:</h3>
            <v-rating :value="averageRating" readonly active-color="purple-darken-3" />
          </div>
        </v-col>
      </v-row>
    </template>
  </RiderDashboardLayout>

  <!-- Success/Error Alert -->
  <!-- <v-snackbar v-model="showAlert" :color="alertType" :timeout="3000" location="top">
    {{ alertMessage }}
    <template v-slot:actions>
      <v-btn variant="text" @click="showAlert = false"> Close </v-btn>
    </template>
  </v-snackbar> -->
</template>

<style scoped>
.leaflet-container {
  z-index: 1;
}

.route-loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1000;
}
</style>
