<script setup>
import { ref } from 'vue'

const LogIndialog = ref(false)
const Registerdialog = ref(false)
</script>

<template>
  <v-container fluid class="bg-purple-lighten-4">
    <v-row>
      <v-col cols="4"></v-col>
      <v-col cols="4" class="d-flex flex-column align-center">
        <h1 class="title-name"><v-icon class="pr-5">mdi-racing-helmet</v-icon>MotoGo</h1>
        <v-spacer></v-spacer>
        <img class="background-img" src="/images/logo11.png" width="350px" />
      </v-col>
      <v-col cols="4"></v-col>
    </v-row>
    <v-row>
      <v-col cols="4"></v-col>
      <v-col cols="4">
        <div class="pa-4 text-center">
          <v-dialog v-model="LogIndialog" max-width="600">
            <template v-slot:activator="{ props: activatorProps }">
              <v-btn
                class="text-none font-weight-bold button-btn"
                color="purple-darken-4"
                v-bind="activatorProps"
              >
                Log In
              </v-btn>
            </template>

            <v-card class="card-container" rounded="xl">
              <v-row>
                <v-col cols="12" class="d-flex justify-center pt-10 name-log" size="40">
                  <h1><v-icon>mdi-account</v-icon>Log In</h1></v-col
                >
              </v-row>
              <v-card-text elevate="9">
                <v-row class="d-flex justify-center">
                  <v-col cols="12" md="4" sm="6" class="text-white">
                    <v-text-field variant="outlined" label="Username" required></v-text-field>
                    <v-text-field
                      variant="outlined"
                      label="Password"
                      type="password"
                      required
                    ></v-text-field>

                    <br />
                  </v-col>

                  <!-- <v-col cols="12" md="4" sm="6" class="text-white"> -->
                  <!-- <v-text-field variant="outlined" label="Password" required></v-text-field>

                    <-- <v-text-field
                      variant="outlined"
                      label="Confirm Password"
                      type="password"
                      required
                    ></v-text-field> -->
                  <!-- <v-text-field variant="outlined" label="Password" required></v-text-field> -->
                  <!-- </v-col> -->
                </v-row>
              </v-card-text>

              <v-divider></v-divider>

              <v-card-actions class="d-flex justify-center">
                <v-btn text="Close" variant="plain" @click="LogIndialog = false"></v-btn>

                <v-btn
                  class="butn-btn"
                  color="white"
                  text="Save"
                  variant="white"
                  @click="LogIndialog = false"
                ></v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
      </v-col>
      <v-col cols="4"> </v-col>
    </v-row>
    <v-row>
      <v-col cols="4"></v-col>
      <v-col cols="4"
        ><div class="pa-4 text-center">
          <v-dialog v-model="Registerdialog" max-width="600">
            <template v-slot:activator="{ props: activatorProps }">
              <v-btn
                class="text-none font-weight-bold button-btn"
                color="purple-darken-4"
                v-bind="activatorProps"
              >
                Register
              </v-btn>
            </template>

            <v-card class="card-container" rounded="xl">
              <v-row>
                <v-col cols="12" class="d-flex justify-center pt-10 name-log" size="40">
                  <h1><v-icon>mdi-account-plus</v-icon>Register</h1></v-col
                >
              </v-row>
              <v-card-text elevate="9">
                <v-row class="justify-center">
                  <v-col cols="12" md="4" sm="6" class="text-white">
                    <v-text-field
                      width="100%"
                      variant="outlined"
                      label="Username"
                      required
                    ></v-text-field>
                    <!-- <v-text-field
                      variant="outlined"
                      label="Password"
                      type="password"
                      required
                    ></v-text-field> -->
                  </v-col>

                  <!-- <v-col cols="12" md="4" sm="6" class="text-white"> -->
                  <!-- <v-text-field variant="outlined" label="Password" required></v-text-field>

                    <-- <v-text-field
                      variant="outlined"
                      label="Confirm Password"
                      type="password"
                      required
                    ></v-text-field> -->
                  <!-- <v-text-field variant="outlined" label="Password" required></v-text-field> -->
                  <!-- </v-col> -->
                </v-row>
                <v-row>
                  <v-col cols="12" md="4" sm="6" lg="4" class="text-white">
                    <!-- <v-text-field variant="outlined" label="Password" required></v-text-field>

                    <-- <v-text-field
                      variant="outlined"
                      label="Confirm Password"
                      type="password"
                      required
                    ></v-text-field> -->
                    <v-text-field
                      width="100%"
                      variant="outlined"
                      label="Password"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card-text>

              <v-divider></v-divider>

              <v-card-actions class="d-flex justify-center">
                <v-btn text="Close" variant="plain" @click="Registerdialog = false"></v-btn>

                <v-btn
                  class="butn-btn"
                  color="white"
                  text="Save"
                  variant="white"
                  @click="Registerdialog = false"
                ></v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog></div
      ></v-col>
      <v-col cols="4"> </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.title-name {
  font-size: 4.5rem;
  color: #8e24aa;
}
.name-log {
  font-size: 1.5rem;
  color: #f3e5f5;
}
.background-img {
  /* Example styling */
  border-radius: 8px;
}
.card-container {
  /* opacity: 0.9; */
  width: 100%;
  padding: 50px 30px;
  background-color: rgba(255, 251, 254, 0.1);
  border: 2px solid rgb(245, 20, 207, 0.1);
  border-radius: 10px;
  box-shadow: 10px 20px 30px rgb(252, 246, 252);
  backdrop-filter: blur(3px);
}
.button-btn {
  font-size: large;
}
.text-white {
  border-color: #8e24aa;
}
.butn-btn {
  border: 2px solid #8e24aa;
}
</style>
