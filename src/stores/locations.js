import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'
import { useAuthUserStore } from './authUser'
import { useGeolocation } from '@vueuse/core'

export const useLocationStore = defineStore('locations', () => {
  const { coords } = useGeolocation()
  const authUser = useAuthUserStore()

  const getlocationFromApi = ref([])
  const getLocation = ref([])
  const retrievedLocations = ref([])

  const isLoggedIn = computed(() => {
    return !!authUser.userData?.id
  })

  // Example: manually provide destination (B) or get it from a form or route
  async function getLocations(destinationLat, destinationLng) {
    const userId = authUser.userData?.id

    if (!coords.latitude || !coords.longitude || !userId) {
      console.error('Missing location or user data')
      return
    }

    const payload = {
      longitude_a: coords.longitude,
      latitude_a: coords.latitude,
      longitude_b: destinationLng,
      latitude_b: destinationLat,
      user_id: userId,
    }

    const { data, error } = await supabase.from('locations').insert([payload])

    if (error) {
      console.error('Error inserting:', error)
    } else {
      console.log('Inserted location data:', data)
      getLocation.value = data
    }
  }

  // 🔄 Fetch existing locations from Supabase
  async function fetchLocations() {
    const userId = authUser.userData?.id

    if (!isLoggedIn.value) {
      console.error('User not logged in')
      return
    }

    const { data, error } = await supabase.from('locations').select('*').eq('user_id', userId)

    if (error) {
      console.error('Error fetching locations:', error)
    } else {
      retrievedLocations.value = data
    }
  }

  async function addLocation(location) {
    const userId = authUser.userData?.id

    if (!userId) {
      console.error('User not logged in')
      return
    }

    const payload = {
      longitude_a: location.longitude_a,
      latitude_a: location.latitude_a,
      longitude_b: location.longitude_b,
      latitude_b: location.latitude_b,
      user_id: userId,
    }

    const { data, error } = await supabase.from('locations').insert([payload]).select()

    if (error) {
      console.error('Error adding location:', error)
    } else if (data) {
      getLocation.value.push(...data)
    } else {
      console.warn('No data returned from Supabase insert')
    }
  }

  return {
    getlocationFromApi,
    getLocation,
    retrievedLocations,
    isLoggedIn,
    getLocations,
    fetchLocations,
    addLocation,
  }
})
