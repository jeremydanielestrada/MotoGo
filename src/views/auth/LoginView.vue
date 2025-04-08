<script setup>
import { ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoginForm from '@/components/auth/LoginForm.vue'
</script>

<template>
  <AppLayout>
    <template #content>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="mx-auto" max-width="400" elevation="20">
            <v-card-title>
              <h3 class="font-weight-black text-center">Moto Go</h3>
            </v-card-title>
            <v-card-text class="bg-surface-light pt-4">
              <LoginForm></LoginForm>
              <v-divider class="mt-5"> </v-divider>
              <h5 class="mt-2">
                Don't have an account?<RouterLink to="/register"> register here </RouterLink>
              </h5>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </AppLayout>
</template>

<style scoped>
.icon-image {
  color: #8e24aa;
}

.title-name {
  font-size: 3.5rem;
  padding-left: 40px;
  text-align: center;
}

.tagline {
  font-style: oblique;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 1.5rem;
  padding-left: 70px;
  text-align: center;
}
.image-logo {
  padding-left: 20px;
}
</style>
