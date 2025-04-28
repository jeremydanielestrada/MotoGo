<script setup>
import { ref, onMounted } from 'vue'
import { getAvatarText } from '@/utils/helpers'
import { getuserInformation } from '@/utils/supabase'
import { watch } from 'vue' // FOR THE DETAILS

const userData = ref({
  initials: '',
  email: '',
  fullname: '',
  is_driver: false,
  phone_num: '',
})

// USER INFORMATION
const getuser = async () => {
  const userMetaData = await getuserInformation()

  userData.value.email = userMetaData.email
  userData.value.fullname = userMetaData.firstname + ' ' + userMetaData.lastname
  userData.value.initials = getAvatarText(userData.value.fullname)
  userData.value.is_driver = userMetaData?.is_driver
  userData.value.phone_num = userMetaData.phone
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
const rating = ref(3.5)

// PROFILE PHOTO CHANGER
const profilePhoto = ref('/images/ava.png')

function onProfileChange(e) {
  const file = e.target.files[0]
  if (file) profilePhoto.value = URL.createObjectURL(file)
}
</script>

<template>
  <!-- PROFILE PAGE -->
  <v-card class="profile-card rounded-0" flat>
    <!-- Cover Photo -->
    <v-card>
      <div class="background-pic" elevation="5">
        <v-img src="coverPhoto" height="200px" class="bg-purple-lighten-4">
          <router-link to="/system/passenger-dashboard">
            <v-icon size="30" class="ml-4 mt-2">mdi-keyboard-backspace</v-icon>
          </router-link>
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
        <v-img class="image-profile" :src="profilePhoto" />
        <v-btn icon class="ma-1 button-cover" @click.stop="$refs.profileInput.click()">
          <v-icon size="20">mdi-camera</v-icon>
        </v-btn>
        <input
          type="file"
          ref="profileInput"
          accept="image/*"
          class="d-none"
          @change="onProfileChange"
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

              <h3 class="pl-2">
                {{ rating }}
              </h3>
              <v-divider class="mx-3" vertical></v-divider>
              <v-rating
                size="25"
                v-model="rating"
                active-color="purple"
                color="purple lighten-4"
                half-increments
                hover
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
  border: 4px solid #ba68c8;
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
  background: #ba68c8;
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
  cursor: pointer;
}
.card-details {
  padding: 20px;
}
.editing-area {
  width: 50%;
  display: inline-flex;
}
</style>
