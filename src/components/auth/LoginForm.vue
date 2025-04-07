<<<<<<< HEAD
<template>
  <v-form fast-fail @submit.prevent>
    <v-text-field label="User name" type="text" variant="outlined"></v-text-field>

    <v-text-field label="Password" type="password" variant="outlined"></v-text-field>
    <div class="d-flex justify-center">
      <v-hover v-slot="{ isHovering, props }">
        <v-btn
          v-bind="props"
          :color="isHovering ? 'purple-darken-1' : undefined"
          class="mt-2 submit-button"
          type="submit"
          ripple
          >Submit</v-btn
        >
      </v-hover>
    </div>
  </v-form>
  <v-divider class="mt-5"> </v-divider>
  <h5 class="mt-2">
    Don't have an account?<RouterLink to="/register"> Register Here </RouterLink>
  </h5>
</template>
<style scoped>
.submit-button {
  background-color: #e1bee7;
}
</style>
=======
<script setup>
import { ref } from 'vue'
import { emailValidator, requiredValidator } from '@/utils/validator'
const visible = ref(false)

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
      label="Email"
      type="email"
      prepend-inner-icon="mdi-email-outline"
      variant="outlined"
      :rules="[requiredValidator, emailValidator]"
      v-model="formData.username"
    ></v-text-field>

    <v-text-field
      label="Password"
      variant="outlined"
      :type="visible ? 'text' : 'password'"
      prepend-inner-icon="mdi-lock-outline"
      :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append-inner="visible = !visible"
      :rules="[requiredValidator]"
      v-model="formData.password"
    ></v-text-field>
    <div class="d-flex justify-center">
      <v-btn class="mt-2" type="submit" ripple>Submit</v-btn>
    </div>
  </v-form>
</template>
>>>>>>> origin/development
