<script setup>
import { ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
</script>

<template>
  <AppLayout>
    <template #content>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card
            class="mx-auto"
            prepend-icon="mdi-login"
            subtitle="Log In"
            max-width="400"
            image="/images/Background.jpg"
            elevation="20"
          >
            <template v-slot:title>
              <span class="font-weight-black">Moto Go</span>
            </template>

            <v-card-text class="bg-surface-light pt-4">
              <v-form fast-fail @submit.prevent>
                <v-text-field label="User name" type="text" variant="outlined"></v-text-field>

                <v-text-field label="Password" type="password" variant="outlined"></v-text-field>
                <div class="d-flex justify-center">
                  <v-btn class="mt-2" type="submit" ripple>Submit</v-btn>
                </div>
              </v-form>
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

<style></style>
