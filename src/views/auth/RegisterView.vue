<script setup>
import RegisterForm from '@/components/auth/RegisterForm.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
</script>

<template>
  <AppLayout>
    <template #content>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="mx-auto" max-width="400" image="/images/Background.jpg" elevation="20">
            <h2 class="py-2 text-center"><v-icon icon="mdi-account-plus"></v-icon>Register</h2>

            <v-card-text class="bg-surface-light pt-3">
              <RegisterForm></RegisterForm>
              <v-divider class="mt-3"> </v-divider>
              <h5 class="mt-2">
                Register as a driver?<RouterLink to="/driver-register"> Register here </RouterLink>
              </h5>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </AppLayout>
</template>
