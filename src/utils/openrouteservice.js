import axios from 'axios'

const apiKey = '5b3ce3597851110001cf6248c205cf9c26d84099907afd1e86c6766c' // Replace this with your actual OpenRouteService API key

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
