import axios from 'axios'

const apiKey = import.meta.env.VITE_OPENROUTESERVICE_API_KEY

export const OpenRouteService = {
  async getRoute(start, end) {
    const url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson'

    try {
      const response = await axios.post(
        url,
        {
          coordinates: [start, end],
        },
        {
          headers: {
            Authorization: apiKey,
            'Content-Type': 'application/json',
          },
        },
      )

      return response.data
    } catch (error) {
      console.error('OpenRouteService error:', error)
      throw error
    }
  },
}
