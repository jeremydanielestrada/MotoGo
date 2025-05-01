import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'
import { useAuthUserStore } from './authUser'
import { useGeolocation } from '@vueuse/core'
import { useMessageStore } from './messages'

const { coords } = useGeolocation()

export const useBookingStore = defineStore('bookings', () => {
  const locationsfromApi = ref([])
  const getBookings = ref([])
  const authUser = useAuthUserStore()
  const bookingNotifications = ref([])
  const activeBooking = ref(null) // Current active booking
  const bookingStatus = ref('none') // none, pending, accepted, completed, cancelled
  const isLoading = ref(false)
  const error = ref(null)
  const availableDrivers = ref([]) // List of available drivers
  let bookingChannel = null

  //notifacations  methods

  function subscribeToBookingUpdates() {
    if (bookingChannel) return

    const userId = authUser.userData?.id
    if (!userId) return

    // In a real app, this would subscribe to real-time updates
    // Since our schema doesn't have all the fields we need, we'll simulate this
    // by just setting up the channel but not actually using it for updates
    bookingChannel = supabase
      .channel('booking-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `rider_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Booking update received:', payload)
          // In a real app with the right schema, we would process updates here
        },
      )
      .subscribe()

    // Our actual updates will be handled by the real rider dashboard
  }

  function unsubscribeFromBookingUpdates() {
    if (bookingChannel) {
      supabase.channel(bookingChannel.topic).unsubscribe()
      bookingChannel = null
    }
  }

  // Request notification permission
  async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission !== 'granted') {
      await Notification.requestPermission()
    }
  }

  // Actions

  // Create a new booking request
  async function createBooking(bookingDetails) {
    isLoading.value = true
    error.value = null

    try {
      // Get current user
      if (!authUser.userData?.id) {
        await authUser.isAuthenticated()
      }

      const userId = authUser.userData?.id
      if (!userId) {
        error.value = 'User not authenticated'
        return { error: error.value }
      }

      // Get current location
      const currentCoords = coords.value
      if (!currentCoords || !currentCoords.latitude || !currentCoords.longitude) {
        error.value = 'Location not available'
        return { error: error.value }
      }

      // Generate a booking reference (stored in memory only)
      const bookingReference = 'BK' + Math.floor(100000 + Math.random() * 900000)

      // First, we need to get a valid location_id from the locations table
      // Let's check if there are any locations
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select('id')
        .limit(1)

      let location_id

      if (locationsError) {
        console.error('Error fetching locations:', locationsError)
        error.value = 'Error fetching locations'
        return { error: error.value }
      }

      // If no locations exist, create one
      if (!locationsData || locationsData.length === 0) {
        // Create a new location with the correct schema
        const locationData = {
          latitude_a: bookingDetails.pickup.lat || currentCoords.latitude,
          longitude_a: bookingDetails.pickup.lng || currentCoords.longitude,
          latitude_b: bookingDetails.dropoff?.lat || null,
          longitude_b: bookingDetails.dropoff?.lng || null,
          user_id: userId,
        }

        console.log('Creating new location with data:', locationData)

        const { data: newLocation, error: newLocationError } = await supabase
          .from('locations')
          .insert([locationData])

        if (newLocationError) {
          console.error('Error creating location:', newLocationError)
          error.value = 'Error creating location'
          return { error: error.value }
        }

        // Get the newly created location ID
        const { data: createdLocation, error: fetchError } = await supabase
          .from('locations')
          .select('id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)

        if (fetchError) {
          console.error('Error fetching created location:', fetchError)
          error.value = 'Error fetching created location'
          return { error: error.value }
        }

        location_id = createdLocation[0]?.id
      } else {
        // Use the first location from the table
        location_id = locationsData[0].id
      }

      // Prepare booking data based on actual schema
      const bookingData = {
        rider_id: userId,
        location_id: location_id,
        rating: authUser.userData?.rating || 0,
      }

      // Insert booking into database
      const { data, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()

      if (bookingError) {
        console.error('Error creating booking:', bookingError)
        error.value = bookingError.message
        return { error: error.value }
      }

      // Add the booking reference to the data in memory (not in DB)
      const bookingWithReference = {
        ...data[0],
        booking_reference: bookingReference,
        pickup_location: {
          latitude: bookingDetails.pickup.lat || currentCoords.latitude,
          longitude: bookingDetails.pickup.lng || currentCoords.longitude,
          address: bookingDetails.pickupAddress,
        },
        dropoff_location: {
          latitude: bookingDetails.dropoff.lat,
          longitude: bookingDetails.dropoff.lng,
          address: bookingDetails.dropoffAddress,
        },
        distance: bookingDetails.distance,
        price: bookingDetails.price,
        notes: bookingDetails.notes,
        status: 'pending',
        created_at: new Date().toISOString(),
      }

      // Set as active booking
      activeBooking.value = bookingWithReference
      bookingStatus.value = 'pending'

      // Subscribe to updates
      subscribeToBookingUpdates()

      // Request notification permission
      requestNotificationPermission()

      // Find available drivers (in a real app, this would be done on the backend)
      await findAvailableDrivers()

      return { data: bookingWithReference, bookingReference }
    } catch (err) {
      console.error('Unexpected error creating booking:', err)
      error.value = 'Unexpected error occurred'
      return { error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Find available drivers (simulated)
  async function findAvailableDrivers() {
    // In a real app, this would query nearby drivers from the backend
    // For demo purposes, we'll generate random drivers
    availableDrivers.value = []

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate 1-3 random drivers
    const driverCount = Math.floor(Math.random() * 3) + 1

    for (let i = 0; i < driverCount; i++) {
      availableDrivers.value.push({
        id: `driver_${Math.floor(1000 + Math.random() * 9000)}`,
        name: `Driver ${i + 1}`,
        rating: (3 + Math.random() * 2).toFixed(1),
        distance: Math.floor(1 + Math.random() * 5), // km away
      })
    }

    // No longer simulating driver responses as we have a real rider dashboard
    // that can receive ride requests

    return availableDrivers.value
  }

  // Enable messaging with the driver
  async function enableMessagingWithDriver(booking) {
    if (!booking.rider_id) return

    const messageStore = useMessageStore()

    // Create a messaging channel between passenger and driver
    await messageStore.createRideMessageChannel({
      booking_reference: booking.booking_reference,
      rider_id: booking.rider_id,
      passenger_id: booking.passenger_id,
      id: booking.id,
    })
  }
  const averagerating = computed(() => {
    if (!locationsfromApi.value.leng) return 0
    const ratings = locationsfromApi.value
      .filter((booking) => booking.rating)
      .map((booking) => booking.rating)
    return ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0
  })

  async function fetchRiderRatings(riderId) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('rating')
        .eq('rider_id', riderId)
        .not('rating', 'is', null)

      if (error) throw error
      return data.map((item) => item.rating)
    } catch (err) {
      console.error('Error fetching ratings:', err)
      return []
    }
  }

  // Retrieve all bookings from Supabase
  async function getBooks() {
    try {
      const { data, error } = await supabase.from('bookings').select('*')

      if (error) {
        console.error('Error fetching bookings:', error)
        return
      }

      getBookings.value = data
    } catch (err) {
      console.error('Unexpected error:', err)
    }
  }

  // Add a rating for a completed booking
  async function rateRider(bookingId, rating) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ rating }) // Update the rating column
        .eq('id', bookingId) // Match the booking by ID

      if (error) {
        console.error('Error updating rating:', error)
        return { error }
      }

      console.log('Rating updated successfully:', data)
      return { data }
    } catch (err) {
      console.error('Unexpected error updating rating:', err)
      return { error: 'Unexpected error occurred' }
    }
  }

  // Cancel an existing booking
  async function cancelBooking(bookingId) {
    isLoading.value = true
    error.value = null

    try {
      // Get current user
      if (!authUser.userData?.id) {
        await authUser.isAuthenticated()
      }

      const userId = authUser.userData?.id
      if (!userId) {
        error.value = 'User not authenticated'
        return { error: error.value }
      }

      // Update local state
      bookingStatus.value = 'cancelled'
      activeBooking.value = null

      return { data: { id: bookingId, status: 'cancelled' } }
    } catch (err) {
      console.error('Unexpected error cancelling booking:', err)
      error.value = 'Unexpected error occurred'
      return { error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Get current booking status
  const currentBookingStatus = computed(() => {
    return bookingStatus.value
  })

  // Check if there's an active booking
  const hasActiveBooking = computed(() => {
    return !!activeBooking.value && ['pending', 'accepted'].includes(bookingStatus.value)
  })

  // Get location (for backward compatibility)
  async function getLocation() {
    const currentCoords = coords.value

    if (!currentCoords || !currentCoords.latitude || !currentCoords.longitude) {
      console.warn('Geolocation not available yet')
      return
    }

    // Prepare location data
    locationsfromApi.value = [
      {
        latitude: currentCoords.latitude,
        longitude: currentCoords.longitude,
      },
    ]

    return locationsfromApi.value
  }

  return {
    // State
    locationsfromApi,
    getBookings,
    activeBooking,
    bookingStatus,
    bookingNotifications,
    isLoading,
    error,
    availableDrivers,

    // Computed
    averagerating,
    currentBookingStatus,
    hasActiveBooking,

    // Actions
    getBooks,
    getLocation,
    createBooking,
    rateRider,
    fetchRiderRatings,

    // Subscriptions
    subscribeToBookingUpdates,
    unsubscribeFromBookingUpdates,
    requestNotificationPermission,
  }
})
