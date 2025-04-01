<script setup>
import { ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import DriverRegistration from '@/components/auth/DriverRegistration.vue'
</script>

<template>
  <AppLayout>
    <template #content>
      <v-row align="center" justify="end">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="mx-auto" max-width="100%" image="/images/Background.jpg" elevation="20">
            <v-card-title class="text-center">
              <v-icon class="">mdi-login</v-icon>
              <h3 class="font-weight-black">Moto Go</h3>
              <p>Driver's form</p>
            </v-card-title>
            <v-card-text class="bg-surface-light pt-4">
              <DriverRegistration></DriverRegistration>
              <v-divider class="mt-5"> </v-divider>
              <h5 class="mt-2 text-center">Moto Go</h5>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </AppLayout>
</template>

<style></style>
