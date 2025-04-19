<script setup>
import { ref } from 'vue'
import { useDriverRegister } from '@/composables/auth/driverRegister'
import {
  requiredValidator,
  emailValidator,
  phoneNumberValidator,
  passwordValidator,
  confirmedValidator,
} from '@/utils/validator'

const isPasswordVisible = ref(false)
const isPasswordConfirmVisible = ref(false)

const { formData, formAction, refVForm, onFormSubmit } = useDriverRegister()
</script>

<template>
  <v-form fast-fail @submit.prevent="onFormSubmit" ref="refVForm">
    <v-text-field
      v-model="formData.firstname"
      class="font-weight-bold"
      label="First Name"
      type="text"
      variant="outlined"
      :rules="[requiredValidator]"
    ></v-text-field>

    <v-text-field
      v-model="formData.lastname"
      class="font-weight-bold"
      label="Last Name"
      type="password"
      variant="outlined"
      :rules="[requiredValidator]"
    ></v-text-field>

    <v-text-field
      v-model="formData.phone"
      class="font-weight-bold"
      prepend-inner-icon="mdi-phone-outline"
      label="Phone Number"
      variant="outlined"
      :rules="[requiredValidator, phoneNumberValidator]"
    ></v-text-field>

    <v-text-field
      v-model="formData.email"
      class="font-weight-bold"
      prepend-inner-icon="mdi-email-outline"
      label="Email"
      variant="outlined"
      :rules="[requiredValidator, emailValidator]"
    ></v-text-field>

    <v-text-field
      v-model="formData.password"
      class="font-weight-bold"
      label="Password"
      prepend-inner-icon="mdi-lock-outline"
      :type="isPasswordVisible ? 'text' : 'password'"
      :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append-inner="isPasswordVisible = !isPasswordVisible"
      variant="outlined"
      :rules="[requiredValidator, passwordValidator]"
    ></v-text-field>

    <v-text-field
      v-model="formData.password_confirmation"
      class="font-weight-bold"
      label="Confirm Password"
      prepend-inner-icon="mdi-lock-outline"
      variant="outlined"
      :type="isPasswordConfirmVisible ? 'text' : 'password'"
      :append-inner-icon="isPasswordConfirmVisible ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append-inner="isPasswordConfirmVisible = !isPasswordConfirmVisible"
      :rules="[
        requiredValidator,
        confirmedValidator(formData.password, formData.password_confirmation),
      ]"
    ></v-text-field>

    <v-file-input
      v-model="formData.license_upload"
      class="font-weight-bold"
      :show-size="1000"
      color="deep-purple-accent-4"
      label="Upload License"
      placeholder="Select your files"
      prepend-icon="mdi-upload-outline"
      counter
      multiple
      variant="plain"
      :rules="[requiredValidator]"
    >
    </v-file-input>

    <v-btn class="butn-btn" color="purple-darken-1" text="REGISTER" type="submit" block> </v-btn>
  </v-form>
</template>
<style scoped>
.v-input__control {
  padding-left: 40px !important; /* Add padding to prevent overlap */
}
</style>
