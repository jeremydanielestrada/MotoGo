<script setup>
import { ref } from 'vue'

const imageItems = [
  { image: '/public/images/promo.png' },
  { image: '/public/images/promo1.png' },
  { image: '/public/images/1.png' },
  { image: '/public/images/2.png' },
]
const colors = ['indigo', 'warning', 'pink darken-2']
const slides = ['/public/images/c10.png', '/public/images/c16.png']
const value = ref(1)
</script>
<template>
  <v-container fluid>
    <v-layout class="overflow-visible" height="56px">
      <v-bottom-navigation v-model="value" grow>
        <v-btn class="active-btn">
          <v-icon>mdi-home</v-icon>
          Home
        </v-btn>

        <v-btn to="/booking">
          <v-icon>mdi-motorbike</v-icon>
          Booking
        </v-btn>
      </v-bottom-navigation>

      <v-app-bar class="pb-2">
        <v-col cols="2">
          <div>
            <img class="pt-4" src="/public/images/motoGO.png" alt="" width="50px" />
          </div>
        </v-col>
        <v-col cols="6" class="pt-10">
          <div>
            <v-text-field
              prepend-inner-icon="mdi-magnify"
              label="Search "
              variant="solo"
              rounded="pill"
            ></v-text-field>
          </div>
        </v-col>
        <v-col cols="4" class="d-flex justify-end">
          <v-btn>
            <v-icon size="55">mdi-account</v-icon>
          </v-btn>
          <v-btn to="/message"> <v-icon size="55">mdi-chat</v-icon> </v-btn>
        </v-col>
      </v-app-bar>
    </v-layout>

    <v-row>
      <v-carousel height="200" show-arrows="hover" cycle hide-delimiter-background>
        <v-carousel-item v-for="(slide, i) in slides" :key="i">
          <v-sheet :color="colors[i]" height="100%">
            <div class="d-flex fill-height justify-center align-center">
              <!-- <div class="text-h2">{{ slide }} Slide</div> -->
              <v-img :src="slide" alt="Slide Image" height="300" cover></v-img>
            </div>
          </v-sheet>
        </v-carousel-item>
      </v-carousel>
    </v-row>

    <v-row>
      <v-col cols="12">
        <br />
        <br />
        <h1 class="pl-4">Vouchers</h1>
        <v-divider class="border-opacity-50" color="warning"></v-divider>
        <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
          <v-slide-group-item
            v-for="(item, index) in imageItems"
            :key="index"
            v-slot="{ isSelected, toggle, selectedClass }"
          >
            <div
              :class="['ma-4', selectedClass, 'custom-slide-item']"
              :style="{
                height: '350px',
                width: '350px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'box-shadow 0.3s ease',
              }"
              @click="toggle"
            >
              <v-hover v-slot="{ isHovering, props }" open-delay="200" class="hover-image">
                <img
                  v-bind="props"
                  :elevation="isHovering ? 16 : 2"
                  :class="{ 'hover-effect': isHovering }"
                  :src="item.image"
                  alt="Slide Image"
                  class="responsive-image"
                  height="100%"
                  width="80%"
                  cover
                />
              </v-hover>
              <v-scale-transition>
                <v-icon
                  v-if="isSelected"
                  color="white"
                  icon="mdi-close-circle-outline"
                  size="48"
                  class="position-absolute"
                  style="top: 10px; right: 10px"
                ></v-icon>
              </v-scale-transition>
            </div>
          </v-slide-group-item>
        </v-slide-group>
      </v-col>
    </v-row>
  </v-container>
  <br />
  <br />
</template>
<style>
.bg-logo {
  background-image: url('/public/images/1100000.png'); /* Path to your image */
  background-size: cover; /* Ensures the image covers the entire area */
  background-repeat: no-repeat; /* Prevents the image from repeating */
  background-position: center; /* Centers the image */
  height: 400px; /* Default height */
  width: 100%; /* Default width */
}

/* Responsive Design */
@media (max-width: 1024px) {
  .bg-logo {
    height: 250px; /* Adjust height for tablets */
    width: 100%; /* Full width for tablets */
  }
}

@media (max-width: 768px) {
  .bg-logo {
    height: 200px; /* Adjust height for smaller tablets */
    width: 100%; /* Full width for smaller tablets */
  }
}

@media (max-width: 480px) {
  .bg-logo {
    height: 150px; /* Adjust height for mobile devices */
    width: 100%; /* Full width for mobile devices */
  }
}
.custom-slide-item {
  height: 350px;
  width: 350px;
  border-radius: 8px; /* Optional: Add rounded corners */
}

/* .responsive-image {
  height: 100%;
  width: 100%;
  object-fit: cover; 
  border-radius: 8px;
} */

/* Responsive Design */
@media (max-width: 1024px) {
  .custom-slide-item {
    height: 300px;
    width: 300px;
  }
}

@media (max-width: 768px) {
  .custom-slide-item {
    height: 250px;
    width: 250px;
  }
}

@media (max-width: 480px) {
  .custom-slide-item {
    height: 200px;
    width: 200px;
  }
}
.active-btn {
  background-color: #6a1b9a !important; /* Darker teal for active state */
  color: white !important; /* Ensure text and icon are visible */
  border-radius: 8px; /* Optional: Add rounded corners */
}
.responsive-image.hover-effect {
  transform: scale(1.05); /* Slightly enlarge the image on hover */
  filter: brightness(1.1); /* Brighten the image on hover */
}
</style>
