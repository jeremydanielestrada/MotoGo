import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'
import { useAuthUserStore } from './authUser'
import { useGeolocation } from '@vueuse/core'

const { coords } = useGeolocation()

export const useBookingStore = defineStore('bookings', () => {
  const locationsfromApi = ref([])
  const getBookings = ref([])
  const authUser = useAuthUserStore()
  const bookingNotifications = ref([])
  let bookingChannel = null

  //notifacations  methods

  function subscribeToBookingUpdates() {
    if (bookingChannel) return

    const userId = authUser.userData?.id
    if (!userId) return

    bookingChannel = supabase
      .channel('booking-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `passenger_id=eq.${userId}`,
        },
        (payload) => {
          const updatedBooking = payload.new
          const status = updatedBooking.status

          if (status === 'accepted' || status === 'rejected') {
            bookingNotifications.value.unshift({
              id: updatedBooking.id,
              message: `Your booking was ${status}`,
              timestamp: new Date().toLocaleString(),
            })
          }
        },
      )
      .subscribe()
  }

  function unsubscribeFromBookingUpdates() {
    if (bookingChannel) {
      supabase.removeChannel(bookingChannel)
      bookingChannel = null
    }
  }

  // Actions

  // Retrieve geolocation and insert into bookings table
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

    const transformedData = locationsfromApi.value.map((location) => {
      return {
        rider_id: authUser.userData.id, // Corrected field name
        location, // Assuming location is a JSON field
        rating: authUser.userData.rating, // Ensure rating exists in userData
      }
    })

    try {
      const { data, error } = await supabase.from('bookings').insert(transformedData).select()

      if (error) {
        console.error('Error inserting booking:', error)
        return
      }

      if (data) {
        await getBooks()
        console.log('Inserted booking:', data)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
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

  return {
    locationsfromApi,
    getBookings,
    getBooks,
    getLocation,
    bookingNotifications,
    subscribeToBookingUpdates,
    unsubscribeFromBookingUpdates,
  }
})
