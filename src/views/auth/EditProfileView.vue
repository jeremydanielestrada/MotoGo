<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAvatarText } from '@/utils/helpers'
import { getuserInformation } from '@/utils/supabase'
import { watch } from 'vue'
import { useAuthUserStore } from '@/stores/authUser'
import { supabase } from '@/utils/supabase'
import { useBookingStore } from '@/stores/bookings'
const uploadImg = useAuthUserStore()

const loadingUser = ref(true)

const userData = ref({
  id: '',
  initials: '',
  email: '',
  fullname: '',
  is_driver: false,
  phone_num: '',
  image_url: '',
})
const userRole = ref(null)

const bookingStore = useBookingStore()
const userRating = ref(0)
// const userRating = computed(() => bookingStore.averageRating)

onMounted(async () => {
  const authUserStore = useAuthUserStore()
  await authUserStore.isAuthenticated()

  if (authUserStore.userData?.id) {
    const ratings = await bookingStore.fetchRiderRatings(authUserStore.userData.id)
    userRating.value = ratings.length
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : 0
  }
})

// const onFileChange = async (event) => {
//   const file = event.target.files[0]
//   if (!file) return

//   // Make sure userData.value.id exists
//   if (!userData.value.id) {
//     alert('User data not loaded yet. Please wait.')
//     console.log(userData.id)
//     return
//   }

//   const result = await uploadImg.updateUserImage(file, userData.value.id)
//   if (result && !result.error) {
//     // Update the local userData with new image URL
//     userData.value.image_url = result.image_url
//     console.log('Updated image_url:', userData.value.image_url)
//   } else {
//     // Handle error (show notification, etc.)
//     alert('Failed to upload image')
//   }
// }

// const onFileChange = async (event) => {
//   const file = event.target.files[0]
//   if (!file) return

//   // Make sure userData.value.id exists
//   if (!userData.value.id) {
//     alert('User data not loaded yet. Please wait.')
//     console.log(userData.value.id)
//     return
//   }

//   try {
//     await uploadImg.updateUserImage(file, userData.value.id)
//     // After successful upload, refresh user data
//     await getuser()  // This will fetch the updated user info including the new image_url
//   } catch (error) {
//     console.error('Error updating image:', error)
//     alert('Failed to upload image')
//   }
// }

/// working function
const onFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    await uploadImg.updateUserImage(file, userData.value.id)
    // Force a refresh of user data
    await getuser()
    // Force component re-render
    userData.value = { ...userData.value }
  } catch (error) {
    console.error('Error updating image:', error)
    alert('Failed to upload image')
  }
}

// USER INFORMATION
// const getuser = async () => {
//   loadingUser.value = true
//   const userMetaData = await getuserInformation()

//   if (!userMetaData || !userMetaData.id) {
//     alert('User not logged in or user data not available!')
//     return
//   }

//   userData.value.id = userMetaData.id
//   userData.value.email = userMetaData.email
//   userData.value.fullname = userMetaData.firstname + ' ' + userMetaData.lastname
//   userData.value.initials = getAvatarText(userData.value.fullname)
//   userData.value.is_driver = userMetaData?.is_driver
//   userData.value.phone_num = userMetaData.phone
//   userData.value.image_url = userMetaData.image_url
//   loadingUser.value = false
// }

// Check if user is a driver directly from Supabase
async function checkUserRole() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting user:', error.message)
    return null
  }

  if (data && data.user) {
    // Store the role in a local ref
    userRole.value = data.user.user_metadata?.is_driver === true ? 'driver' : 'passenger'
    return data.user
  }

  return null
}

// Determine dashboard path based on direct user role check
const dashboardPath = computed(() => {
  return userRole.value === 'driver' ? '/system/rider-dashboard' : '/system/passenger-dashboard'
})

// Combine the onMounted hooks
onMounted(async () => {
  // Get user role directly from Supabase
  await checkUserRole()
})

const getuser = async () => {
  loadingUser.value = true
  const userMetaData = await getuserInformation()

  if (!userMetaData || !userMetaData.id) {
    alert('User not logged in or user data not available!')
    loadingUser.value = false
    return
  }

  console.log('Retrieved user data:', userMetaData) // Add this to debug

  userData.value.id = userMetaData.id
  userData.value.email = userMetaData.email
  userData.value.fullname = userMetaData.firstname + ' ' + userMetaData.lastname
  userData.value.initials = getAvatarText(userData.value.fullname)
  userData.value.is_driver = userMetaData?.is_driver
  userData.value.phone_num = userMetaData.phone
  userData.value.image_url = userMetaData.image_url

  console.log('Updated userData image_url:', userData.value.image_url) // Add this to debug

  loadingUser.value = false
}

onMounted(() => {
  getuser()
})

// EDIT FOR DETAILS
const plateNumber = ref(localStorage.getItem('plateNumber') || '')
const phoneNumber = ref(localStorage.getItem('phoneNumber') || '')
const isEditing = ref(false)
const isPhoneNum = ref(false)
// automatically save whenever you change plateNumber

watch(plateNumber, (newVal) => {
  localStorage.setItem('plateNumber', newVal)
})

// automatically save whenever you change phoneNumber
watch(phoneNumber, (newVal) => {
  localStorage.setItem('phoneNumber', newVal)
})
// RATING

// PROFILE PHOTO CHANGER
const fallbackImage = ref('/images/ava.png')
</script>

<template>
  <!-- PROFILE PAGE -->
  <v-card class="profile-card rounded-0" flat>
    <!-- Cover Photo -->
    <v-card>
      <div class="background-pic" elevation="5">
        <v-img height="200px" class="bg-purple-lighten-2">
          <router-link to="/system/passenger-dashboard">
            <v-icon color="white" size="30" class="ml-4 mt-2">mdi-keyboard-backspace</v-icon>
          </router-link>
        </v-img>
        <v-img src="coverPhoto" height="200px" class="bg-purple-lighten-4">
          <v-btn :to="dashboardPath" text class="ma-2">
            <v-icon>mdi-keyboard-backspace</v-icon>
            back
          </v-btn>
          <input
            type="file"
            ref="coverInput"
            accept="image/*"
            class="d-none"
            @change="onCoverChange"
          />
        </v-img>
      </div>
    </v-card>

    <!-- Profile Picture -->
    <div>
      <v-avatar size="150" class="profile-avatar elevation-4">
        <v-img
          class="image-profile"
          :src="userData.image_url ? `${userData.image_url}?t=${Date.now()}` : fallbackImage"
          :key="Date.now()"
        />
        <v-btn icon class="ma-1 button-cover" @click.stop="$refs.profileInput.click()">
          <v-icon color="white" size="20">mdi-camera</v-icon>
        </v-btn>
        <input
          type="file"
          ref="profileInput"
          accept="image/*"
          class="d-none"
          @change="onFileChange"
          :disabled="loadingUser"
        />
      </v-avatar>
    </div>

    <br />
    <br />
    <br />

    <!-- Rider Info -->

    <div class="text-center mt-8">
      <h2 class="text-h4 font-weight-bold">
        {{ userData.fullname
        }}<v-icon color="blue" size="20" class="ml-2" title="Verified User">
          mdi-check-decagram
        </v-icon>
      </h2>
      <!-- IF RIDER, PASSENGER, OR ADMIN BA -->
      <p class="text-body-3 text-medium-emphasis">
        {{ userData.is_driver === true ? 'Rider' : 'Passenger' }}
      </p>
    </div>

    <br />

    <!-- DETAILS -->
    <v-container>
      <v-row class="d-flex justify-center">
        <v-divider></v-divider>
        <v-col cols="12" sm="6" md="4">
          <v-card elevation="5" class="card-details" v-if="userData.is_driver">
            <div>
              <h2 class="ml-2">Details:</h2>
              <v-list-item>
                <div>
                  <v-list-item-title>
                    Plate Number:
                    <div
                      v-if="!isEditing"
                      @click="isEditing = true"
                      style="display: inline-flex; align-items: center; cursor: pointer"
                    >
                      <span>{{ plateNumber }}</span>
                      <v-icon size="15" class="ml-2">mdi-pencil</v-icon>
                    </div>
                    <v-text-field
                      v-else
                      v-model="plateNumber"
                      variant="underlined"
                      size="15"
                      append-icon="mdi-check"
                      @click:append="isEditing = false"
                      style="display: inline-flex"
                      class="ma-0 pa-0"
                      hide-details
                      single-line
                      density="compact"
                    />
                  </v-list-item-title>
                  <v-divider class="pb-2"></v-divider>
                  <v-list-item-title
                    >Phone Number:
                    <div
                      v-if="!isPhoneNum"
                      @click="isPhoneNum = true"
                      style="display: inline-flex; align-items: center; cursor: pointer"
                    >
                      <span>{{ userData.phone_num }}</span>
                      <v-icon size="15" class="ml-2">mdi-pencil</v-icon>
                    </div>
                    <v-text-field
                      v-else
                      v-model="userData.phone_num"
                      variant="underlined"
                      size="15"
                      append-icon="mdi-check"
                      @click:append="isPhoneNum = false"
                      style="display: inline-flex"
                      class="ma-0 pa-0"
                      hide-details
                      single-line
                      density="compact"
                    />
                  </v-list-item-title>
                  <v-divider class="pb-2"></v-divider>
                </div>
              </v-list-item>
            </div>
            <div class="d-flex align-center justify-center">
              <br />
              <h3 class="title-rating">Ratings:</h3>

              <h3 class="pl-2"></h3>
              <v-divider class="mx-3" vertical></v-divider>
              <v-rating
                size="25"
                :model-value="userRating"
                active-color="purple"
                color="purple lighten-4"
                hover
                readonly
              ></v-rating>
            </div>
          </v-card>

          <v-card v-else>
            <div>
              <h2 class="ml-2">Details:</h2>
              <v-list-item>
                <div>
                  <v-divider class="pb-2"></v-divider>
                  <v-list-item-title
                    >Phone Number:
                    <div
                      v-if="!isPhoneNum"
                      @click="isPhoneNum = true"
                      style="display: inline-flex; align-items: center; cursor: pointer"
                    >
                      <b>{{ userData.phone_num }}</b>
                      <v-icon size="15" class="ml-2">mdi-pencil</v-icon>
                    </div>
                    <v-text-field
                      v-else
                      v-model="userData.phone_num"
                      variant="underlined"
                      size="15"
                      append-icon="mdi-check"
                      @click:append="isPhoneNum = false"
                      style="display: inline-flex"
                      class="ma-0 pa-0"
                      hide-details
                      single-line
                      density="compact"
                    />
                  </v-list-item-title>
                  <v-divider class="pb-2"></v-divider>
                </div>
              </v-list-item>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<style scoped>
.profile-card {
  position: relative;
}

.profile-avatar {
  position: absolute;
  top: 150px;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid #6a1b9a;
  overflow: visible;
  cursor: pointer;
}

.d-none {
  display: none;
}

.button-cover {
  position: absolute;
  right: 0;
  bottom: 0;
  box-shadow: none;
  background: #6a1b9a;
}
.close-btn {
  background: none;
  box-shadow: none;
}

.image-profile {
  border-radius: 50%;
}

.background-pic {
  /* border: 2px solid whitesmoke; */
  border-bottom-right-radius: 30px;
}
.card-details {
  padding: 20px;
}
.editing-area {
  width: 50%;
  display: inline-flex;
}
</style>
