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
          to="/home"
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
