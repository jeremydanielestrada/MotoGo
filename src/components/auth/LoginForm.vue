<template>
  <v-form fast-fail @submit.prevent>
    <v-text-field label="User name" type="text" variant="outlined"></v-text-field>

    <v-text-field label="Password" type="password" variant="outlined"></v-text-field>
    <div class="d-flex justify-center">
      <v-btn class="mt-2" type="submit" ripple>Submit</v-btn>
    </div>
  </v-form>
</template>
