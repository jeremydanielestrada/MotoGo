<script setup>
import { requiredValidator, emailValidator } from '@/utils/validator'
import { useLogin } from '@/composables/auth/login'
import AlertNotification from '../common/AlertNotification.vue'
import { ref } from 'vue'

const LogIndialog = ref(false)
const { formData, formAction, refVForm, onFormSubmit } = useLogin()
const isPasswordVisible = ref(false)
</script>

<template>
  <v-row class="card-border">
    <v-col cols="12">
      <div class="pa-4 text-center">
        <v-dialog v-model="LogIndialog" max-width="600">
          <template v-slot:activator="{ props: activatorProps }">
            <v-btn
              class="text-none font-weight-bold button-btn"
              color="purple-darken-2"
              width="150px"
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
            <v-container>
              <v-card-text elevate="9">
                <v-row class="d-flex justify-center">
                  <v-col cols="12" md="4" sm="6" lg="10" class="text-black">
                    <AlertNotification
                      :form-success-message="formAction.formSuccessMessage"
                      :form-error-message="formAction.formErrorMessage"
                    >
                    </AlertNotification>
                    <v-form ref="refVForm" fast-fail @submit.prevent="onFormSubmit">
                      <v-text-field
                        v-model="formData.email"
                        class="font-weight-bold"
                        prepend-inner-icon="mdi-email-outline"
                        label="Email"
                        type="email"
                        variant="outlined"
                        :rules="[requiredValidator, emailValidator]"
                      ></v-text-field>

                      <v-text-field
                        v-model="formData.password"
                        label="Password"
                        prepend-inner-icon="mdi-lock-outline"
                        :type="isPasswordVisible ? 'text' : 'password'"
                        :append-inner-icon="
                          isPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
                        "
                        @click:append-inner="isPasswordVisible = !isPasswordVisible"
                        class="font-weight-bold"
                        variant="outlined"
                        :rules="[requiredValidator]"
                      ></v-text-field>

                      <v-btn
                        color="purple-darken-1"
                        type="submit"
                        text="Log in"
                        block
                        ripple
                      ></v-btn>
                    </v-form>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-container>

            <v-divider></v-divider>

            <v-card-actions class="d-flex justify-center">
              <v-btn text="Close" variant="plain" @click="LogIndialog = false"></v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-col>
    <v-col cols="4"> </v-col>
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
  /* Example styling */
  border-radius: 8px;
}
.card-container {
  /* opacity: 0.9; */
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
