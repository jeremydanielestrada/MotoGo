<script setup>
import DriverRegistrationForm from '@/components/auth/DriverRegistrationForm.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
</script>

<template>
  <AppLayout>
    <template #content>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="mx-auto" max-width="400" image="/images/Background.jpg" elevation="20">
            <template v-slot:prepend>
              <v-icon icon="mdi-motorbike"></v-icon>
            </template>
            <template v-slot:title>
              <span class="font-weight-black">Register as Driver</span>
            </template>

            <v-card-text class="bg-surface-light pt-4">
              <DriverRegistrationForm></DriverRegistrationForm>
              <v-divider class="mt-5"> </v-divider>
              <h5 class="mt-2">Already have an account?<RouterLink to="/"> Log In </RouterLink></h5>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </AppLayout>
</template>

<style></style>
