<script setup>
import { ref } from 'vue'
import DriverRegistrationForm from './DriverRegistrationForm.vue'
const tab = ref('Passenger')
const items = ['Passenger', 'Driver']
const LogIndialog = ref(false)
const Registerdialog = ref(false)
const isPasswordVisible = ref(false)
const isPasswordConfirmVisible = ref(false)
</script>

<template>
  <v-row>
    <v-col cols="12">
      <div class="pa-4 text-center">
        <v-dialog v-model="Registerdialog" max-width="600">
          <template v-slot:activator="{ props: activatorProps }">
            <v-btn
              class="text-none font-weight-bold button-btn"
              color="purple-darken-2"
              width="150px"
              v-bind="activatorProps"
            >
              Register
            </v-btn>
          </template>

          <v-card class="card-container" rounded="xl">
            <v-row>
              <v-col cols="12" class="d-flex justify-center pb-5 pt-5 name-log">
                <h1><v-icon>mdi-account-plus</v-icon>Register</h1>
              </v-col>
            </v-row>
            <v-divider></v-divider>
            <v-card-text elevate="9">
              <v-row>
                <v-col>
                  <div>
                    <!-- Tabs -->
                    <v-tabs v-model="tab" grow>
                      <v-tab v-for="item in items" :key="item" :value="item">{{ item }}</v-tab>
                    </v-tabs>

                    <!-- Tab Content -->
                    <v-tabs-window v-model="tab">
                      <!-- Appetizers Content -->
                      <v-tabs-window-item value="Passenger">
                        <div flat>
                          <v-card-text>
                            <v-form fast-fail @submit.prevent>
                              <v-text-field
                                class="font-weight-bold"
                                label="First Name"
                                type="text"
                                variant="outlined"
                              ></v-text-field>

                              <v-text-field
                                class="font-weight-bold"
                                label="Last Name"
                                type="password"
                                variant="outlined"
                              ></v-text-field>

                              <v-text-field
                                class="font-weight-bold"
                                prepend-inner-icon="mdi-phone-outline"
                                label="Phone Number"
                                type="phone"
                                variant="outlined"
                              ></v-text-field>

                              <v-text-field
                                class="font-weight-bold"
                                prepend-inner-icon="mdi-email-outline"
                                label="Email"
                                type="text"
                                variant="outlined"
                              ></v-text-field>

                              <v-text-field
                                class="font-weight-bold"
                                label="Password"
                                prepend-inner-icon="mdi-lock-outline"
                                :type="isPasswordVisible ? 'text' : 'password'"
                                :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
                                @click:append-inner="isPasswordVisible = !isPasswordVisible"
                                variant="outlined"
                              ></v-text-field>

                              <v-text-field
                                class="font-weight-bold"
                                label="Confirm Password"
                                prepend-inner-icon="mdi-lock-outline"
                                variant="outlined"
                                :type="isPasswordConfirmVisible ? 'text' : 'password'"
                                :append-inner-icon="
                                  isPasswordConfirmVisible ? 'mdi-eye-off' : 'mdi-eye'
                                "
                                @click:append-inner="
                                  isPasswordConfirmVisible = !isPasswordConfirmVisible
                                "
                              ></v-text-field>

                              <v-btn
                                color="purple-darken-1"
                                text="REGISTER"
                                @click="Registerdialog = false"
                                block
                                type="submit"
                              >
                              </v-btn>
                            </v-form>
                          </v-card-text>
                        </div>
                      </v-tabs-window-item>

                      <!-- Entrees Content -->
                      <v-tabs-window-item value="Driver">
                        <div flat>
                          <v-card-text>
                            <DriverRegistrationForm></DriverRegistrationForm>
                          </v-card-text>
                        </div>
                      </v-tabs-window-item>
                    </v-tabs-window>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="d-flex justify-center">
              <v-btn text="Close" variant="plain" @click="Registerdialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-col>
  </v-row>
</template>

<style scoped>
.title-name {
  font-size: 4.5rem;
  color: #8e24aa;
}
.name-log {
  font-size: 1.5rem;
  color: purple;
}
.background-img {
  border-radius: 8px;
}
.card-container {
  width: 100%;
  padding: 50px 30px;
  background-color: rgba(255, 251, 254, 0.4);
  border: 2px solid rgb(245, 20, 207, 0.1);
  border-radius: 10px;
  box-shadow: 10px 20px 30px rgb(252, 246, 252);
  backdrop-filter: blur(10px);
}

.text-white {
  border-color: #8e24aa;
}
.butn-btn {
  background-color: #d500f9;
}
</style>
