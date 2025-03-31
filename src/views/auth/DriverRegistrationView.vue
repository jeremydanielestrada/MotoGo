<script setup>
import { ref } from 'vue'

const theme = ref('light')

function onClick() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>

<template>
  <v-responsive class="border rounded">
    <v-app :theme="theme">
      <v-app-bar color="purple-darken-1">
        <v-spacer></v-spacer>

        <v-btn
          :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          text="Toggle Theme"
          slim
          @click="onClick"
        ></v-btn>
      </v-app-bar>

      <v-main>
        <v-container>
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
                    <div class="d-flex ga-2">
                      <v-text-field
                        label="First Name"
                        type="text"
                        variant="outlined"
                        max-width="200"
                      ></v-text-field>
                      <v-text-field
                        label="Last Name"
                        type="password"
                        variant="outlined"
                        max-width="200"
                      ></v-text-field>
                    </div>

                    <v-text-field
                      label="Phone Number"
                      type="phone"
                      variant="outlined"
                    ></v-text-field>

                    <v-text-field
                      label="Password"
                      type="password"
                      variant="outlined"
                    ></v-text-field>

                    <v-text-field
                      label="Retype Password"
                      type="password"
                      variant="outlined"
                    ></v-text-field>

                    <v-file-input
                      :show-size="1000"
                      color="deep-purple-accent-4"
                      label="Upload License"
                      placeholder="Select your files"
                      prepend-icon="mdi-upload-outline"
                      counter
                      multiple
                      variant="plained"
                    >
                    </v-file-input>

                    <div class="d-flex justify-center">
                      <v-btn type="submit" ripple prepend-icon="mdi-account-arrow-right-outline"
                        >Submit</v-btn
                      >
                    </div>
                  </v-form>
                  <v-divider class="mt-5"> </v-divider>
                  <h5 class="mt-2 text-center">Moto Go</h5>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-main>
      <v-footer border app> new project</v-footer>
    </v-app>
  </v-responsive>
</template>

<style></style>
