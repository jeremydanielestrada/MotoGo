<script setup>
import { ref } from 'vue'
import {
  confirmedValidator,
  emailValidator,
  integerValidator,
  passwordValidator,
  requiredValidator,
} from '@/utils/validator'

const refVform = ref()

const formDataDefault = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  email: '',
  password: '',
  confirmPassword: '',
}

const formData = ref({
  ...formDataDefault,
})

const onLogin = () => {}

const onSubmit = () => {
  refVform.value?.validate().then(({ valid }) => {
    if (valid) {
      onLogin()
    }
  })
}
</script>

<template>
  <v-form fast-fail @submit.prevent="onSubmit">
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          label="First Name"
          type="text"
          variant="outlined"
          v-model="formData.firstName"
          :rules="[requiredValidator]"
        ></v-text-field>
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          label="Last Name"
          type="password"
          variant="outlined"
          v-model="formData.lastName"
          :rules="[requiredValidator]"
        ></v-text-field>
      </v-col>

      <v-col cols="12" md="12">
        <v-text-field
          label="Phone Number"
          type="phone"
          variant="outlined"
          v-model="formData.phoneNumber"
          :rules="[requiredValidator, integerValidator]"
        ></v-text-field>
      </v-col>

      <v-col cols="12" md="12">
        <v-text-field
          label="Email"
          type="email"
          variant="outlined"
          v-model="formData.email"
          :rules="[requiredValidator, emailValidator]"
        ></v-text-field>
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          label="Password"
          type="password"
          variant="outlined"
          v-model="formData.password"
          :rules="[requiredValidator, passwordValidator]"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          label="Confirm  Password"
          type="password"
          variant="outlined"
          v-model="formData.confirmPassword"
          :rules="[requiredValidator, confirmedValidator]"
        ></v-text-field>
      </v-col>
      <v-col align="center" justify="center">
        <v-btn class="mt-2" type="submit" ripple>Submit</v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>
