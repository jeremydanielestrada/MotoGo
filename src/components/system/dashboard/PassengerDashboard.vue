<script setup>
import { ref, onMounted } from 'vue'
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()
const imageItems = [
  { image: '/public/images/promo.png' },
  { image: '/public/images/promo1.png' },
  { image: '/public/images/1.png' },
  { image: '/public/images/2.png' },
]
const colors = ['indigo', 'warning', 'pink darken-2']
const slides = ['/public/images/c10.png', '/public/images/c16.png']
const value = ref(1)
const model = ref(null) // Define the model variable for v-model binding
const showVouchers = ref(false) // Control the rendering of the vouchers section

const hideDisplay = ref(false)
onMounted(() => {
  // Delay rendering to trigger the transition
  setTimeout(() => {
    showVouchers.value = true
  }, 500) // Adjust the delay as needed
})
</script>

<template>
  <v-app>
    <v-container fluid>
      <!-- Bottom Navigation for Mobile -->
      <v-bottom-navigation v-if="mobile" grow class="mobile-nav">
        <v-btn class="active-btn">
          <v-icon>mdi-home</v-icon>
          Home
        </v-btn>
        <v-btn to="/booking">
          <v-icon>mdi-motorbike</v-icon>
          Booking
        </v-btn>
        <v-btn icon to="/message">
          <v-icon>mdi-chat</v-icon>
          Message
        </v-btn>
        <v-btn icon>
          <v-icon>mdi-account</v-icon>
          Profile
        </v-btn>
      </v-bottom-navigation>

      <!-- App Bar -->
      <v-app-bar>
        <v-col
          :cols="mobile ? 12 : 3"
          md="2"
          sm="3"
          xs="4"
          class="d-flex justify-center align-center"
        >
          <div>
            <img class="pt-4" src="/public/images/motoGO.png" alt="MotoGo Logo" width="40px" />
          </div>
          <h1 class="text-italic text-purple-darken-3">MotoGo</h1>
        </v-col>
        <v-spacer></v-spacer>
        <v-col
          cols="3"
          md="2"
          sm="3"
          xs="4"
          class="d-flex justify-center align-center ga-1 mx-3"
          v-if="mobile ? hideDisplay : !hideDisplay"
        >
          <v-btn class="active-btn">
            <v-icon>mdi-home</v-icon>
            Home
          </v-btn>
          <v-btn to="/booking">
            <v-icon>mdi-motorbike</v-icon>
            Booking
          </v-btn>
          <v-btn icon>
            <v-icon size="30">mdi-account</v-icon>
          </v-btn>
          <v-btn icon to="/message">
            <v-icon size="30">mdi-chat</v-icon>
          </v-btn>
        </v-col>
      </v-app-bar>

      <!-- Carousel -->
      <v-row class="mt-16">
        <v-col :cols="mobile ? 12 : 8" class="mx-auto">
          <v-carousel
            :height="mobile ? '200' : '300'"
            show-arrows="hover"
            cycle
            hide-delimiter-background
          >
            <v-carousel-item v-for="(slide, i) in slides" :key="i">
              <v-sheet :color="colors[i]" height="100%">
                <div class="d-flex fill-height justify-center align-center">
                  <v-img
                    :src="slide"
                    alt="Slide Image"
                    :height="mobile ? '200' : '300'"
                    cover
                  ></v-img>
                </div>
              </v-sheet>
            </v-carousel-item>
          </v-carousel>
        </v-col>
      </v-row>

      <!-- Vouchers Section -->
      <v-slide-y-transition>
        <v-row v-if="showVouchers">
          <v-col cols="12">
            <h1 class="text-center text-purple-darken-3">Vouchers</h1>
            <v-divider class="border-opacity-50" color="purple-darken-3"></v-divider>
            <v-row justify="center" align="center" class="pa-4">
              <v-slide-group v-model="model" selected-class="bg-success" show-arrows>
                <v-slide-group-item
                  v-for="(item, index) in imageItems"
                  :key="index"
                  v-slot="{ isSelected, toggle, selectedClass }"
                >
                  <div
                    :class="['ma-4', selectedClass, 'custom-slide-item']"
                    :style="{
                      height: mobile ? '250px' : '350px',
                      width: mobile ? '250px' : '350px',
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
                    <v-hover v-slot="{ isHovering, props }" open-delay="200">
                      <div
                        v-bind="props"
                        class="hover-image d-flex justify-center align-center"
                        :class="{ 'hover-effect': isHovering }"
                        style="
                          height: 100%;
                          width: 100%;
                          transition:
                            transform 0.3s ease,
                            filter 0.3s ease;
                        "
                      >
                        <img
                          :src="item.image"
                          alt="Voucher Image"
                          class="responsive-image"
                          :class="{ 'hover-effect': isHovering }"
                          style="
                            transition:
                              transform 0.3s ease,
                              filter 0.3s ease;
                            width: 100%;
                            height: 100%;
                          "
                        />
                      </div>
                    </v-hover>
                    <v-scale-transition>
                      <v-icon
                        v-if="isSelected"
                        color="black"
                        icon="mdi-close-circle-outline"
                        size="48"
                        class="position-absolute"
                        style="top: 10px; right: 10px"
                      ></v-icon>
                    </v-scale-transition>
                  </div>
                </v-slide-group-item>
              </v-slide-group>
            </v-row>
          </v-col>
        </v-row>
      </v-slide-y-transition>
    </v-container>
  </v-app>
</template>

<style scoped>
.bg-logo {
  background-image: url('/public/images/1100000.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  height: 400px;
  width: 100%;
}

@media (max-width: 1024px) {
  .bg-logo {
    height: 250px;
  }
}

@media (max-width: 768px) {
  .bg-logo {
    height: 200px;
  }
}

@media (max-width: 480px) {
  .bg-logo {
    height: 150px;
  }
}

.custom-slide-item {
  border-radius: 8px;
}

@media (max-width: 768px) {
  .custom-slide-item {
    height: 250px;
    width: 250px;
  }
}

.active-btn {
  background-color: #6a1b9a !important;
  color: white !important;
  border-radius: 8px;
}

.responsive-image.hover-effect {
  transform: scale(1.05);
  filter: brightness(1.1);
  transition:
    transform 0.3s ease,
    filter 0.3s ease;
}

.text-italic {
  font-style: italic;
  font-weight: 600;
}

.mobile-nav {
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 10;
}
</style>
