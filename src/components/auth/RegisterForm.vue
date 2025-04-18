<script setup>
import { ref } from 'vue'

const tab = ref('Passenger')
const items = ['Passenger', 'Driver']
const LogIndialog = ref(false)
const Registerdialog = ref(false)
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
                                prepend-inner-icon="mdi-account"
                                label="Email"
                                type="text"
                                variant="outlined"
                              ></v-text-field>

                              <v-text-field
                                class="font-weight-bold"
                                label="Password"
                                prepend-inner-icon="mdi-lock"
                                type="password"
                                variant="outlined"
                              ></v-text-field>
                            </v-form>
                          </v-card-text>
                        </div>
                      </v-tabs-window-item>

                      <!-- Entrees Content -->
                      <v-tabs-window-item value="Driver">
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
                                label="Phone Number"
                                type="phone"
                                variant="outlined"
                              ></v-text-field>

                              <v-text-field
                                class="font-weight-bold"
                                label="Password"
                                type="password"
                                variant="outlined"
                              ></v-text-field>

                              <v-text-field
                                class="font-weight-bold"
                                label="Confirm Password"
                                type="password"
                                variant="outlined"
                              ></v-text-field>

                              <v-file-input
                                class="font-weight-bold"
                                :show-size="1000"
                                color="deep-purple-accent-4"
                                label="Upload License"
                                placeholder="Select your files"
                                prepend-icon="mdi-upload-outline"
                                counter
                                multiple
                                variant="plain"
                              >
                              </v-file-input>
                            </v-form>
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
              <v-btn
                class="butn-btn"
                color="white"
                text="Save"
                variant="white"
                @click="Registerdialog = false"
              >
                Save
              </v-btn>
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
.button-btn {
  font-size: medium;
  border: 1px solid #8e24aa;
}
.text-white {
  border-color: #8e24aa;
}
.butn-btn {
  background-color: #d500f9;
}
</style>
