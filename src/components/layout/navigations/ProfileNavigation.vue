<script setup>
import { ref, onMounted } from 'vue'
import { getAvatarText } from '@/utils/helpers'
import { supabase, formActionDefault, getuserInformation } from '@/utils/supabase'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
const { mobile } = useDisplay()
import { useAuthUserStore } from '@/stores/authUser'

const router = useRouter()

const userData = ref({
  initials: '',
  email: '',
  fullname: '',
  image_url: '',
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
  const userMetaData = await getuserInformation()

  userData.value.email = userMetaData.email
  userData.value.fullname = userMetaData.firstname + ' ' + userMetaData.lastname
  userData.value.initials = getAvatarText(userData.value.fullname)
  userData.value.image_url = userMetaData.image_url
}

onMounted(() => {
  getuser()
})
</script>

<template>
  <v-menu min-width="200px">
    <template v-slot:activator="{ props }">
      <v-btn icon v-bind="props">
        <v-avatar
          v-if="userData.image_url"
          color="purple-lighten-4"
          size="large"
          :image="userData.image_url"
        >
        </v-avatar>

        <v-avatar color="purple-lighten-4" size="large" v-else>
          <span class="text-h5">{{ userData.initials }}</span>
        </v-avatar>
      </v-btn>
    </template>
    <v-card>
      <v-card-text>
        <div class="mx-auto text-center">
          <v-avatar
            v-if="userData.image_url"
            color="purple-lighten-4"
            size="large"
            :image="userData.image_url"
          >
          </v-avatar>

          <v-avatar color="purple-lighten-4" v-else>
            <span class="text-h5">{{ userData.initials }}</span>
          </v-avatar>
          <h3>{{ userData.fullname }}</h3>
          <p class="text-caption mt-1">
            {{ userData.email }}
          </p>
          <v-divider class="my-3"></v-divider>
          <v-btn to="/edit-profile" variant="text" rounded prepend-icon="mdi-cog-outline">
            Edit Account
          </v-btn>
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
