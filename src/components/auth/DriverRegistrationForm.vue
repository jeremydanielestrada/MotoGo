<template>
  <v-form fast-fail @submit.prevent>
    <v-text-field label="First Name" type="text" variant="outlined"></v-text-field>

    <v-text-field label="Last Name" type="password" variant="outlined"></v-text-field>

    <v-text-field label="Phone Number" type="phone" variant="outlined"></v-text-field>

    <v-text-field label="Password" type="password" variant="outlined"></v-text-field>

    <v-text-field label="Confirm Password" type="password" variant="outlined"></v-text-field>

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
</template>
<style scoped>
.submit-button {
  background-color: #e1bee7;
}
</style>
