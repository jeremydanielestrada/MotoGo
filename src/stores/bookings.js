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

  return { locationsfromApi, getBookings, getBooks, getLocation }
})
