<script setup>
import { ref } from 'vue'
import avatarImage from '/images/ava.png'
import RiderDashboardLayout from '@/components/layout/dashboards/RiderDashboardLayout.vue'
import { LMap, LTileLayer, LMarker, LPopup, LIcon, LPolyline } from '@vue-leaflet/vue-leaflet'

const map = ref(null)
const center = ref([12.8797, 121.774]) // Default center (Philippines)
const zoom = ref(6) // Add zoom level

// Fetch location suggestions
// const fetchSuggestions = async (query, type) => {
//   if (!query) {
//     if (type === 'pickup') pickupSuggestions.value = []
//     else dropoffSuggestions.value = []
//     return
//   }

//   try {
//     const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
//       params: {
//         q: query,
//         key: GEOCODING_API_KEY,
//         limit: 5,
//       },
//     })

//     const suggestions = response.data.results.map((result) => ({
//       name: result.formatted,
//       lat: result.geometry.lat,
//       lng: result.geometry.lng,
//     }))

//     if (type === 'pickup') pickupSuggestions.value = suggestions
//     else dropoffSuggestions.value = suggestions
//   } catch (error) {
//     console.error('Error fetching suggestions:', error)
//   }
// }
</script>

<template>
  <RiderDashboardLayout>
    <template #drawer>
      <h5 class="text-h6 text-center py-2">Ride Request</h5>
      <v-divider></v-divider>
      <v-list class="mx-5">
        <v-list-item border="thin" class="py-2 my-2" width="200" rounded>
          <div class="d-flex justify-center align-center ga-1">
            <v-avatar :image="avatarImage"></v-avatar>
            <h3>Riders Name</h3>
          </div>
          <div class="d-flex justify-center align-center ga-1 py-2 mx-3">
            <v-btn size="x-small" color="success">ACCEPT</v-btn>
            <v-btn size="x-small" color="red">REJECT</v-btn>
          </div>
        </v-list-item>

        <v-list-item border="thin" class="py-2 my-2" width="200" rounded>
          <div class="d-flex justify-center align-center ga-1">
            <v-avatar :image="avatarImage"></v-avatar>
            <h3>Riders Name</h3>
          </div>
          <div class="d-flex justify-center align-center ga-1 py-2 mx-3">
            <v-btn size="x-small" color="success">ACCEPT</v-btn>
            <v-btn size="x-small" color="red">REJECT</v-btn>
          </div>
        </v-list-item>
      </v-list>
    </template>

    <template #content>
      <!-- Main content goes here -->

      <v-row>
        <v-col cols="12" md="8">
          <v-card>
            <v-card-text>
              <div style="height: 500px; width: 100%; z-index: 0">
                <!-- Added z-index -->
                <l-map ref="map" v-model:zoom="zoom" :center="center" style="height: 100%">
                  <!-- Added style -->
                  <l-tile-layer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    layer-type="base"
                    name="OpenStreetMap"
                  ></l-tile-layer>

                  <!-- Pickup Marker -->
                  <!-- <l-marker v-if="pickup.lat" :lat-lng="[pickup.lat, pickup.lng]">
                    <l-popup>Pickup Location</l-popup>
                    <l-icon
                      :icon-url="pickupIcon"
                      :icon-size="[25, 41]"
                      :icon-anchor="[12, 41]"
                    ></l-icon>
                  </l-marker> -->

                  <!-- Dropoff Marker -->
                  <!-- <l-marker v-if="dropoff.lat" :lat-lng="[dropoff.lat, dropoff.lng]">
                    <l-popup>Drop-off Location</l-popup>
                    <l-icon
                      :icon-url="dropoffIcon"
                      :icon-size="[25, 41]"
                      :icon-anchor="[12, 41]"
                    ></l-icon>
                  </l-marker> -->

                  <!-- Route line if both points are set -->
                  <!-- <l-polyline
                    v-if="pickup.lat && dropoff.lat"
                    :lat-lngs="routePoints"
                    color="blue"
                  ></l-polyline> -->
                </l-map>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4" sm="8">
          <v-card height="530px">
            <v-card-text>
              <div>
                <h2 class="text-center py-1">On Going Ride</h2>
              </div>
              <v-divider></v-divider>

              <p>Booking Status</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </RiderDashboardLayout>
</template>

<style scoped>
.leaflet-container {
  z-index: 1;
}
</style>
