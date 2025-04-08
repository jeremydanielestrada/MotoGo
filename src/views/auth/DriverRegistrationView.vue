<script setup>
<<<<<<< HEAD
import { ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import DriverRegistration from '@/components/auth/DriverRegistration.vue'
=======
import DriverRegistrationForm from '@/components/auth/DriverRegistrationForm.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
>>>>>>> development
</script>

<template>
  <AppLayout>
    <template #content>
<<<<<<< HEAD
      <v-row align="center" justify="end">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="mx-auto" max-width="100%" elevation="20">
            <v-card-title class="text-center">
              <h3 class="font-weight-black">Moto Go</h3>
              <p>Driver's form</p>
            </v-card-title>
            <v-card-text class="bg-surface-light pt-4">
              <DriverRegistration></DriverRegistration>
              <v-divider class="mt-5"> </v-divider>
              <h5 class="mt-2 text-center">Moto Go</h5>
=======
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card
            class="mx-auto"
            prepend-icon="mdi-motorbike"
            max-width="400"
            image="/images/Background.jpg"
            elevation="20"
          >
            <template v-slot:title>
              <span class="font-weight-black">Register as Driver</span>
            </template>

            <v-card-text class="bg-surface-light pt-4">
              <DriverRegistrationForm></DriverRegistrationForm>
              <v-divider class="mt-5"> </v-divider>
              <h5 class="mt-2">Already have an account?<RouterLink to="/"> Log In </RouterLink></h5>
>>>>>>> development
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </AppLayout>
</template>

<style></style>
