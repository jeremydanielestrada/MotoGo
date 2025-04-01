<script setup>
import { ref } from 'vue'
import { requiredValidator } from '@/utils/validator'
const isPasswordVisiblle = ref(false)

const refVform = ref()

const formDataDefault = {
  username: '',
  password: '',
}

const formData = ref({
  ...formDataDefault, //extract data from the default variable
})

const onLogin = () => {
  alert(formData.value.username)
  alert(formData.value.password)
  formData.value.password = ''
  formData.value.username = ''
}

const onSubmit = () => {
  refVform.value?.validate().then(({ valid }) => {
    if (valid) {
      onLogin()
    }
  })
}
</script>

<template>
  <v-form ref="refVform" fast-fail @submit.prevent="onSubmit">
    <v-text-field
      label="User name"
      type="text"
      variant="outlined"
      :rules="[requiredValidator]"
      v-model="formData.username"
    ></v-text-field>

    <v-text-field
      label="Password"
      type="password"
      variant="outlined"
      :rules="[requiredValidator]"
      v-model="formData.password"
    ></v-text-field>
    <div class="d-flex justify-center">
      <v-btn class="mt-2" type="submit" ripple>Submit</v-btn>
    </div>
  </v-form>
</template>
