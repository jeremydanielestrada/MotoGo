<script setup>
import { ref } from 'vue'
import avatarImage from '/images/ava.png'
import RiderDashboardLayout from '@/components/layout/dashboards/RiderDashboardLayout.vue'
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
    </template>
  </RiderDashboardLayout>
</template>
