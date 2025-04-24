import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'
import { useAuthUserStore } from './authUser'
import { useGeolocation } from '@vueuse/core'
const { coords } = useGeolocation()

// not finalize functionalities
export const useBookingStore = defineStore('bookings', () => {
  const locationsfromApi = ref([])
  const getBookings = ref([])

  const authUser = useAuthUserStore()

  //getters
  // const sample = computed(() => count.value * 2)

  //Actions

  //retriver from api and insert more to bookings table in supabase
  async function getLocation() {
    // Directly use the reactive `coords` object
    const currentCoords = coords.value

    if (!currentCoords || !currentCoords.latitude || !currentCoords.longitude) {
      console.warn('Geolocation not available yet')
      return
    }

    // Prepare a dummy API-like response using current geolocation
    locationsfromApi.value = [
      {
        data: {
          latitude: currentCoords.latitude,
          longitude: currentCoords.longitude,
        },
      },
    ]

    const transformedData = locationsfromApi.value.map((location) => {
      return {
        raider_id: authUser.userData.id,
        location: location.data,
        rating: authUser.rating,
      }
    })

    const { data, error } = await supabase.from('bookings').insert(transformedData).select()

    if (error) {
      console.error('Error inserting into bookings:', error)
      return
    }

    if (data) {
      await getBooks()
      console.log('Inserted booking:', data)
    }
  }

  //retrieve from supabase

  async function getBooks() {
    const { data } = await supabase.from('bookings').select('*')

    getBookings.value = data
  }

  return { locationsfromApi, getBookings, getBooks, getLocation } /// return  the functions and state
})
