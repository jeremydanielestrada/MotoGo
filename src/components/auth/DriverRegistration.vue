<template>
  <v-form fast-fail @submit.prevent>
    <div class="d-flex ga-2">
      <v-text-field
        label="First Name"
        type="text"
        variant="outlined"
        max-width="200"
      ></v-text-field>
      <v-text-field
        label="Last Name"
        type="password"
        variant="outlined"
        max-width="200"
      ></v-text-field>
    </div>

    <v-text-field label="Phone Number" type="phone" variant="outlined"></v-text-field>

    <v-text-field label="Password" type="password" variant="outlined"></v-text-field>

    <v-text-field label="Retype Password" type="password" variant="outlined"></v-text-field>

    <v-file-input
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

    <div class="d-flex justify-center">
      <v-btn
        class="bg-purple-darken-1"
        type="submit"
        ripple
        append-icon="mdi-account-arrow-right-outline"
        >Submit</v-btn
      >
    </div>
  </v-form>
</template>
