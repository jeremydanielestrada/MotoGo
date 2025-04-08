<script setup>
import { ref } from 'vue'
import {
  confirmedValidator,
  emailValidator,
  integerValidator,
  passwordValidator,
  requiredValidator,
} from '@/utils/validator'
import { supabase, formActionDefault } from '@/utils/supabase'
import AlertNotification from '../common/AlertNotification.vue'

const refVform = ref()
const visible = ref(false)

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

const formAction = ref({
  ...formActionDefault,
})

const onLogin = async () => {
  console.log('onLogin called')
  console.log('Submitting form data:', formData.value)
  formAction.value = { ...formActionDefault }
  formAction.value.formProcess = true

  const { data, error } = await supabase.auth.signUp({
    email: formData.value.email,
    password: formData.value.password,
    options: {
      data: {
        firstName: formData.value.firstName,
        lastName: formData.value.lastName,
        phoneNumber: formData.value.phoneNumber,
      },
    },
  })
  if (error) {
    console.log(error)
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status
  } else if (data) {
    console.log(data)
    formAction.value.formSuccessMessage = 'Succes fully registered'
    formAction.value.formStatus = data.status
    refVform.value?.reset()
  }

  formAction.value.formProcess = false
}

const onSubmit = () => {
  refVform.value?.validate().then(({ valid }) => {
    console.log('Form valid:', valid)
    if (valid) {
      onLogin()
    }
  })
}
</script>

<template>
  <AlertNotification
    :form-success-message="formAction.formSuccessMessage"
    :form-error-message="formAction.formErrorMessage"
  >
  </AlertNotification>

  <v-form ref="refVform" class="mt-5" fast-fail @submit.prevent="onSubmit">
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
          type="text"
          variant="outlined"
          v-model="formData.lastName"
          :rules="[requiredValidator]"
        ></v-text-field>
      </v-col>

      <v-col cols="12" md="12">
        <v-text-field
          label="Phone Number"
          type="phone"
          prepend-inner-icon="mdi-phone"
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
          prepend-inner-icon="mdi-lock-outline"
          v-model="formData.password"
          :rules="[requiredValidator, passwordValidator]"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          label="Confirm Password"
          :type="visible ? 'text' : 'password'"
          variant="outlined"
          prepend-inner-icon="mdi-lock-outline"
          v-model="formData.confirmPassword"
          :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="visible = !visible"
          :rules="[
            requiredValidator,
            confirmedValidator(formData.confirmPassword, formData.password),
          ]"
        ></v-text-field>
      </v-col>
      <v-col align="center" justify="center">
        <v-btn
          class="mt-2"
          type="submit"
          ripple
          :disabled="formAction.formProcess"
          :loading="formAction.formProcess"
          >Submit</v-btn
        >
      </v-col>
    </v-row>
  </v-form>
</template>
