<script setup>
import { ref, onMounted } from 'vue'
import { getAvatarText } from '@/utils/helpers'
import { supabase, formActionDefault } from '@/utils/supabase'
import { useRouter } from 'vue-router'
const router = useRouter()

const userData = ref({
  initials: '',
  email: '',
  fullname: '',
})

const formAction = ref({ ...formActionDefault })

//Log Out functionality

const onLogout = async () => {
  formAction.value = { ...formActionDefault }
  formAction.value.formProcess = true

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error during LogOut:', error)
    return
  }

  formAction.value.formProcess = false
  router.replace('/')
}

//getting user information functionality
const getuser = async () => {
  const {
    data: {
      user: { user_metadata: metadata },
    },
  } = await supabase.auth.getUser()

  userData.value.email = metadata.email
  userData.value.fullname = metadata.firstname + ' ' + metadata.lastname
  userData.value.initials = getAvatarText(userData.value.fullname)
}

onMounted(() => {
  getuser()
})
</script>

<template>
  <v-menu min-width="200px">
    <template v-slot:activator="{ props }">
      <v-btn icon v-bind="props">
        <v-avatar color="purple-lighten-4" size="large">
          <span class="text-h5">{{ userData.initials }}</span>
        </v-avatar>
      </v-btn>
    </template>
    <v-card>
      <v-card-text>
        <div class="mx-auto text-center">
          <v-avatar color="purple-lighten-4">
            <span class="text-h5">{{ userData.initials }}</span>
          </v-avatar>
          <h3>{{ userData.fullname }}</h3>
          <p class="text-caption mt-1">
            {{ userData.email }}
          </p>
          <v-divider class="my-3"></v-divider>
          <v-btn variant="text" rounded prepend-icon="mdi-cog-outline"> Edit Account </v-btn>
          <v-divider class="my-3"></v-divider>
          <v-btn
            variant="text"
            rounded
            prepend-icon="mdi-logout"
            @click="onLogout"
            :loading="formAction.formProcess"
            :disabled="formAction.formProcess"
          >
            Log Out
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-menu>
</template>
