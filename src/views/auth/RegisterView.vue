<script setup>
<<<<<<< HEAD
import RegisterForm from '@/components/auth/RegisterForm.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
=======
import { ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'
>>>>>>> origin/development
</script>

<template>
  <AppLayout>
    <template #content>
<<<<<<< HEAD
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="mx-auto" max-width="400" image="/images/Background.jpg" elevation="20">
            <h2 class="py-2 text-center"><v-icon icon="mdi-account-plus"></v-icon>Register</h2>

            <v-card-text class="bg-surface-light pt-3">
              <RegisterForm></RegisterForm>
              <v-divider class="mt-3"> </v-divider>
              <h5 class="mt-2">
                Register as a driver?<RouterLink to="/driver-register"> Register here </RouterLink>
=======
      <v-row align="center" justify="end">
        <v-col cols="12" md="6" sm="8" lg="4">
          <v-card class="mx-auto" max-width="100%" elevation="20">
            <v-card-title>
              <h3 class="font-weight-black text-center">Moto Go</h3>
            </v-card-title>
            <v-card-text class="bg-surface-light pt-4">
              <RegisterForm></RegisterForm>
              <v-divider class="mt-5"> </v-divider>
              <h5 class="mt-2">
                Register as a driver?<RouterLink to="/driver-register"> Click here </RouterLink>
>>>>>>> origin/development
              </h5>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </AppLayout>
</template>
