<script setup>
import { ref } from 'vue'
import { h } from 'vue'

const SheetFooter = {
  setup(_, { slots }) {
    return () =>
      h(
        'v-sheet',
        {
          class: 'ma-auto px-4',
          color: 'rgba(0, 0, 0, .36)',
          height: 50,
        },
        slots.default(),
      )
  },
}
</script>
<template>
  <v-container fluid>
    <v-row class="flex-child text-subtitle-2">
      <v-col class="d-flex border-card" cols="12" md="4"><h1>po</h1></v-col>
      <v-col class="d-flex border-2" cols="12" md="4"><h1>hello</h1> </v-col>
    </v-row>
  </v-container>
</template>
<style scoped>
.border-card {
  border: 5px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}
</style>
