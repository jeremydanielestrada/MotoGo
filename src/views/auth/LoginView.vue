<script setup>
import LoginForm from '@/components/auth/LoginForm.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="6" md="5" lg="5">
            <template v-slot="title">
              <v-row>
                <h1 class="font-weight-bold title-name">
                  <v-icon class="icon-image" icon="mdi-racing-helmet"></v-icon>MotoGo
                </h1>
              </v-row>
              <v-row>
                <h1 class="tagline">Ride Smart, Ride Safe</h1>
              </v-row>
              <v-row>
                <img class="image-logo" src="/images/logo11.png" width="95%" />
              </v-row>
            </template>
          </v-col>

          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card class="mx-auto bg-purple-darken-1" max-width="400" elevation="20">
              <v-card-title>
                <h3 class="text-center">Log In</h3>
              </v-card-title>
              <v-card-text class="bg-surface-light pt-4">
                <LoginForm></LoginForm>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
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
