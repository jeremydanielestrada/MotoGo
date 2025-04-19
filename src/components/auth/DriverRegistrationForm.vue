<script setup>
import { ref } from 'vue'

const isPasswordVisible = ref(false)
const isPasswordConfirmVisible = ref(false)
</script>

<template>
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
      :type="isPasswordConfirmVisible ? 'text' : 'password'"
      :append-inner-icon="isPasswordConfirmVisible ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append-inner="isPasswordConfirmVisible = !isPasswordConfirmVisible"
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

    <v-btn class="butn-btn" color="purple-darken-1" text="REGISTER" type="submit" block> </v-btn>
  </v-form>
</template>
<style scoped></style>
