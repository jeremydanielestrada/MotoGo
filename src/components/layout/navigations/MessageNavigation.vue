<script setup>
import { ref, watch, onMounted } from 'vue' // Import ref
import { useDisplay } from 'vuetify'

const { mdAndUp, smAndDown } = useDisplay()

// Accept the modelValue prop
const props = defineProps({
  modelValue: Boolean,
})

// Emit updates to the parent
const emit = defineEmits(['update:modelValue'])

// Use a local ref for drawer and synchronize with modelValue
const drawer = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newValue) => {
    drawer.value = newValue
  },
  { immediate: true },
)

watch(drawer, (newValue) => {
  emit('update:modelValue', newValue)
})

import avatarImage from '/images/ava.png' // Adjust the path as needed

const messages = ref([
  {
    text: 'Hello, how can I help you today?',
    from: 'Avatar',
    ava: avatarImage,
  },
])

onMounted(() => {
  // Ensure the drawer starts closed on mount
  if (mdAndUp.value) {
    drawer.value = false
    emit('update:modelValue', false)
  }
})

watch(
  mdAndUp,
  (isDesktop) => {
    if (isDesktop) {
      drawer.value = false // Always close drawer on desktop
      emit('update:modelValue', false)
    }
  },
  { immediate: true },
)
</script>

<template>
  <v-navigation-drawer v-if="smAndDown" v-model="drawer" :location="'left'" :width="400">
    <v-list>
      <v-list-item
        flat
        class="mt-3 cursor-pointer"
        elevation="0"
        v-for="(msg, index) in messages"
        :key="index"
        style="border: 1px solid #ddd; border-radius: 8px; margin: 0"
      >
        <div class="d-flex align-center me-10">
          <img :src="msg.ava" alt="Avatar" width="50" class="avatar-img" />
          <div class="title-container">
            <v-card-title class="text-h6 mb-1">{{ msg.from }}</v-card-title>
            <v-card-subtitle class="text-subtitle-2 text-truncate">
              {{ msg.text }}
            </v-card-subtitle>
          </div>
        </div>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>
.avatar-img {
  border-radius: 100%;
  padding: 5px;
}

.title-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-right: 30px;
}

.title-container .v-card-title {
  margin-bottom: 0;
  line-height: 1.2;
}
</style>
