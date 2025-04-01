<script setup>
import { ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'
</script>

<template>
  <AppLayout>
    <template #content>
      <v-row align="center" justify="end">
        <v-col cols="12" md="6" sm="8" lg="4">
          <v-card
            class="mx-auto"
            prepend-icon="mdi-login"
            subtitle="Log In"
            max-width="100%"
            image="/images/Background.jpg"
            elevation="20"
          >
            <v-card-title>
              <h3 class="font-weight-black text-center">Moto Go</h3>
            </v-card-title>
            <v-card-text class="bg-surface-light pt-4">
              <RegisterForm></RegisterForm>
              <v-divider class="mt-5"> </v-divider>
              <h5 class="mt-2">
                Register as a driver?<RouterLink to="/driver-register"> Click here </RouterLink>
              </h5>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </AppLayout>
</template>

<style></style>
