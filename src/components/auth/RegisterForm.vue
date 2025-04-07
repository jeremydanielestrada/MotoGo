<script setup>
const rules = {
  required: (value) => !!value || 'Field is required',
}
</script>
<template>
  <v-form fast-fail @submit.prevent>
    <v-text-field
      label="First Name"
      :rules="[rules.required]"
      type="text"
      variant="outlined"
    ></v-text-field>
    <v-text-field
      label="Last Name"
      :rules="[rules.required]"
      type="text"
      variant="outlined"
    ></v-text-field>

    <v-text-field
      label="Phone Number"
      :rules="[rules.required]"
      type="phone"
      variant="outlined"
    ></v-text-field>

    <v-text-field
      label="Password"
      :rules="[rules.required]"
      type="password"
      variant="outlined"
    ></v-text-field>

    <v-text-field
      label="Confirm Password"
      :rules="[rules.required]"
      type="password"
      variant="outlined"
    ></v-text-field>

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
