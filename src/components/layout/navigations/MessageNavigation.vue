<script setup>
import { ref, watch, onMounted } from 'vue'
import { useDisplay } from 'vuetify'

const { mdAndUp, smAndDown } = useDisplay()

const props = defineProps({
  modelValue: Boolean,
  chats: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'select-chat'])

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

function selectChat(chat) {
  emit('select-chat', chat)
  drawer.value = false
}
</script>

<template>
  <v-navigation-drawer v-if="smAndDown" v-model="drawer" :location="'left'" :width="300">
    <v-list>
      <v-list-item class="d-flex justify-space-between pa-4">
        <h2 class="text-h6">Chats</h2>
        <v-btn icon @click="drawer = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-item v-if="props.chats.length === 0" class="pa-4 text-center">
        No conversations yet
      </v-list-item>

      <v-list-item
        v-for="(chat, index) in props.chats"
        :key="index"
        class="pa-2 cursor-pointer"
        @click="selectChat(chat)"
      >
        <div class="d-flex align-center">
          <img :src="chat.ava" alt="Avatar" width="40" class="avatar-img mr-3" />
          <div class="title-container">
            <div class="text-subtitle-1 font-weight-medium">{{ chat.name }}</div>
            <div class="text-caption text-truncate" style="max-width: 180px">
              {{ chat.lastMessage }}
            </div>
          </div>
        </div>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>
.avatar-img {
  border-radius: 100%;
  padding: 2px;
}

.title-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
