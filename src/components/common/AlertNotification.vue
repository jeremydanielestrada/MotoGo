<script setup>
const props = defineProps(['formSuccessMessage', 'formErrorMessage'])
</script>

<template>
  <v-alert
    v-if="props.formSuccessMessage"
    :text="props.formSuccessMessage"
    title="Success!"
    type="Success"
    variant="tonal"
    density="compact"
    border="start"
    closable=""
    class="mb-5"
  >
  </v-alert>

  <v-alert
    v-if="props.formErrorMessage"
    :text="props.formErrorMessage"
    title="Ooops!"
    type="error"
    variant="tonal"
    density="compact"
    border="start"
    closable=""
    class="mb-5"
  >
  </v-alert>
</template>
