<script setup>
import { ref, onMounted, computed } from 'vue'
import { useDisplay } from 'vuetify'
import DashboardLayout from '@/components/layout/dashboards/DashboardLayout.vue'

const { mobile, mdAndDown } = useDisplay()

// Enhanced image items with descriptions and discount information
const imageItems = [
  {
    image: '/images/promo.png',
    title: 'Weekend Special',
    discount: '20% OFF',
    code: 'WEEKEND20',
    expiry: '30 May 2025',
  },
  {
    image: '/images/promo1.png',
    title: 'New User',
    discount: '50% OFF',
    code: 'NEWUSER50',
    expiry: '15 May 2025',
  },
  {
    image: '/images/1.png',
    title: 'Happy Hour',
    discount: '15% OFF',
    code: 'HAPPY15',
    expiry: '20 May 2025',
  },
  {
    image: '/images/2.png',
    title: 'Corporate',
    discount: '25% OFF',
    code: 'CORP25',
    expiry: '10 May 2025',
  },
]

// Enhanced carousel slides with more information
const slides = [
  {
    image: '/images/c10.png',
    title: 'Fast & Reliable Service',
    description: 'Get to your destination on time, every time',
  },
  {
    image: '/images/c16.png',
    title: 'Affordable Rides',
    description: "Quality transportation that won't break the bank",
  },
  {
    image: '/images/c10.png',
    title: 'Safe Journeys',
    description: 'Your safety is our top priority',
  },
]

const model = ref(null)
const showVouchers = ref(false)
const displayVoucherDetails = ref(false)
const selectedVoucher = ref(null)

// For FAQ accordion
const faqItems = [
  {
    question: 'How do I book a ride?',
    answer:
      "Simply open the MotoGo app, enter your destination, select your preferred ride type, and tap 'Book Now'. You'll be matched with a nearby driver in seconds.",
  },
  {
    question: 'How do I redeem vouchers?',
    answer:
      "During the booking process, tap on 'Apply Voucher' and select from your available vouchers or enter a voucher code manually.",
  },
  {
    question: 'Is there a cancellation fee?',
    answer:
      "Cancellations made within 2 minutes of booking are free. After that, a small fee may apply depending on your location and the driver's proximity.",
  },
  {
    question: 'How do I contact my driver?',
    answer:
      'Once your ride is confirmed, you can call or message your driver directly through the app using the contact buttons on the ride tracking screen.',
  },
]

const panel = ref([0])

// Animation timing for staggered appearance
onMounted(() => {
  setTimeout(() => {
    showVouchers.value = true
  }, 500)
})

// Function to view voucher details
const viewVoucherDetails = (voucher) => {
  selectedVoucher.value = voucher
  displayVoucherDetails.value = true
}

// Function to copy voucher code
const copyCode = async (code) => {
  try {
    await navigator.clipboard.writeText(code)
    alert('Voucher code copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy code: ', err)
  }
}

// Computed property for responsive height
const carouselHeight = computed(() => {
  if (mobile.value) return '200'
  return '400'
})
</script>

<template>
  <DashboardLayout>
    <template #content>
      <!-- Enhanced Carousel Section -->
      <v-row class="mt-5">
        <v-col :cols="mobile ? 12 : 10" class="mx-auto">
          <v-carousel
            :height="carouselHeight"
            show-arrows="hover"
            cycle
            hide-delimiter-background
            interval="5000"
            progress="purple-darken-3"
          >
            <v-carousel-item v-for="(slide, i) in slides" :key="i" :src="slide.image" cover>
              <div class="carousel-gradient d-flex flex-column justify-end align-start pa-6">
                <h2 class="text-white text-h3 font-weight-bold">{{ slide.title }}</h2>
                <p class="text-white text-subtitle-1 mt-2">{{ slide.description }}</p>
              </div>
            </v-carousel-item>
          </v-carousel>
        </v-col>
      </v-row>

      <!-- Enhanced Vouchers Section with Animation -->
      <v-slide-y-transition>
        <v-row v-if="showVouchers" class="mt-6">
          <v-col cols="12">
            <h1 class="text-center text-purple-darken-3 mb-4">Special Offers & Vouchers</h1>
            <v-divider class="border-opacity-50 mb-6" color="purple-darken-3"></v-divider>

            <v-row justify="center" align="center" class="pa-4">
              <v-slide-group v-model="model" selected-class="bg-success" show-arrows center-active>
                <v-slide-group-item
                  v-for="(item, index) in imageItems"
                  :key="index"
                  v-slot="{ isSelected, toggle, selectedClass }"
                >
                  <v-scale-transition>
                    <div
                      :class="['ma-4', selectedClass, 'custom-slide-item']"
                      :style="{
                        height: mobile ? '250px' : '320px',
                        width: mobile ? '250px' : '300px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: isSelected
                          ? '0 8px 16px rgba(0,0,0,0.2)'
                          : '0 4px 8px rgba(0,0,0,0.1)',
                      }"
                      @click="viewVoucherDetails(item)"
                    >
                      <v-hover v-slot="{ isHovering, props }">
                        <div
                          v-bind="props"
                          class="hover-image d-flex flex-column justify-center align-center"
                          :class="{ 'hover-effect': isHovering }"
                          style="
                            height: 100%;
                            width: 100%;
                            transition: all 0.4s ease;
                            position: relative;
                          "
                        >
                          <img
                            :src="item.image"
                            alt="Voucher Image"
                            class="responsive-image"
                            :class="{ 'hover-effect': isHovering }"
                            style="width: 100%; height: 100%; object-fit: cover"
                          />
                          <div class="voucher-overlay d-flex flex-column justify-end pa-4">
                            <span class="text-h5 font-weight-bold text-white">{{
                              item.title
                            }}</span>
                            <span class="text-h4 font-weight-black text-white">{{
                              item.discount
                            }}</span>
                            <v-chip
                              class="mt-2"
                              color="purple-lighten-4"
                              label
                              text-color="purple-darken-4"
                            >
                              Expires: {{ item.expiry }}
                            </v-chip>
                          </div>
                        </div>
                      </v-hover>
                    </div>
                  </v-scale-transition>
                </v-slide-group-item>
              </v-slide-group>
            </v-row>
          </v-col>
        </v-row>
      </v-slide-y-transition>

      <!-- Voucher Details Dialog -->
      <v-dialog v-model="displayVoucherDetails" max-width="500">
        <v-card v-if="selectedVoucher" class="pa-4">
          <v-card-title class="text-h4 text-purple-darken-3">
            {{ selectedVoucher.title }}
          </v-card-title>
          <v-card-text>
            <v-img :src="selectedVoucher.image" height="200" cover class="rounded mb-4"></v-img>
            <h2 class="text-h3 font-weight-black text-purple-darken-2 my-4">
              {{ selectedVoucher.discount }}
            </h2>
            <v-row class="mt-4">
              <v-col cols="12">
                <v-sheet
                  color="purple-lighten-5"
                  rounded
                  class="pa-4 d-flex justify-space-between align-center"
                >
                  <span class="text-body-1 font-weight-medium">{{ selectedVoucher.code }}</span>
                  <v-btn color="purple-darken-2" @click="copyCode(selectedVoucher.code)" icon>
                    <v-icon>mdi-content-copy</v-icon>
                  </v-btn>
                </v-sheet>
              </v-col>
            </v-row>
            <p class="mt-4">Valid until: {{ selectedVoucher.expiry }}</p>
            <p class="text-caption mt-2">
              Terms and conditions apply. Cannot be combined with other offers.
            </p>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="purple-darken-3" variant="text" @click="displayVoucherDetails = false"
              >Close</v-btn
            >
            <v-btn color="purple-darken-3" @click="displayVoucherDetails = false">
              Use Now
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- About Section with Improved Layout -->
      <v-row class="my-12">
        <v-col cols="12">
          <h1 class="text-center text-purple-darken-3">About MotoGo</h1>
          <v-divider class="border-opacity-50" color="purple-darken-3"></v-divider>
        </v-col>
      </v-row>

      <v-slide-x-transition>
        <v-card variant="outlined" class="border-color my-6">
          <v-row class="px-5 py-5 d-flex justify-center align-center">
            <v-col cols="12" md="6" sm="12">
              <v-card-text>
                <h3
                  :class="[
                    mobile ? 'text-h5' : 'text-h4',
                    'mb-4 text-purple-darken-2 font-weight-bold',
                  ]"
                >
                  Ride with Confidence
                </h3>
                <p :class="[mobile ? 'text-body-1' : 'text-h6', 'text-medium-emphasis']">
                  Our ride hailing app is built to make transportation easier, safer, and more
                  affordable for everyone. With real-time tracking, reliable drivers, and seamless
                  booking, we connect you to your destination with just a few taps. Whether it's
                  your daily commute or a spontaneous trip, we're here to move you forward —
                  quickly, comfortably, and with care.
                </p>
                <v-btn
                  color="purple-darken-3"
                  class="mt-6"
                  variant="elevated"
                  prepend-icon="mdi-download"
                >
                  Download Our App
                </v-btn>
              </v-card-text>
            </v-col>
            <v-col cols="12" md="6" sm="12" class="d-flex justify-center align-center">
              <v-img
                src="/images/motogoF1.jpg"
                width="500"
                class="rounded-lg elevation-3"
                transition="scale-transition"
              ></v-img>
            </v-col>
          </v-row>
        </v-card>
      </v-slide-x-transition>

      <v-card variant="outlined" class="border-color my-6">
        <v-row class="px-5 py-5 d-flex justify-center align-center">
          <v-col cols="12" md="6" sm="12" class="d-flex justify-center align-center">
            <v-img
              src="/images/motogoF2.jpg"
              width="500"
              class="rounded-lg elevation-3"
              transition="scale-transition"
            ></v-img>
          </v-col>
          <v-col cols="12" md="6" sm="12">
            <v-card-text>
              <h3
                :class="[
                  mobile ? 'text-h5' : 'text-h4',
                  'mb-4 text-purple-darken-2 font-weight-bold',
                ]"
              >
                Future of Mobility
              </h3>
              <p :class="[mobile ? 'text-body-1' : 'text-h6', 'text-medium-emphasis']">
                We're more than just a ride — we're a movement toward smarter, more connected places
                in our city. Our app empowers riders and drivers alike, using technology to simplify
                travel, reduce wait times, and create a more seamless transportation experience.
                Join us as we drive the future of mobility, one ride at a time.
              </p>
              <v-btn
                color="purple-darken-3"
                class="mt-6"
                variant="outlined"
                prepend-icon="mdi-information-outline"
              >
                Learn More About Us
              </v-btn>
            </v-card-text>
          </v-col>
        </v-row>
      </v-card>

      <!-- New Feature: Testimonials/Reviews Section -->
      <!-- <v-row class="my-12">
        <v-col cols="12">
          <h1 class="text-center text-purple-darken-3">What Our Riders Say</h1>
          <v-divider class="border-opacity-50 mb-6" color="purple-darken-3"></v-divider>
        </v-col>

        <v-col cols="12">
          <v-row>
            <v-col v-for="(review, i) in reviews" :key="i" cols="12" md="4" sm="6">
              <v-slide-y-transition>
                <v-card height="100%" class="rounded-lg review-card" variant="outlined" border>
                  <v-card-item>
                    <template v-slot:prepend>
                      <v-avatar class="ma-3" size="48">
                        <v-img :src="review.avatar" alt="avatar"></v-img>
                      </v-avatar>
                    </template>
                    <v-card-title>{{ review.name }}</v-card-title>
                    <v-card-subtitle>
                      <v-rating
                        :model-value="review.rating"
                        color="amber"
                        density="compact"
                        size="small"
                        readonly
                      ></v-rating>
                    </v-card-subtitle>
                  </v-card-item>
                  <v-card-text>
                    <p class="text-body-1">{{ review.text }}</p>
                  </v-card-text>
                </v-card>
              </v-slide-y-transition>
            </v-col>
          </v-row>
        </v-col>
      </v-row> -->

      <!-- New Feature: FAQ Section -->
      <v-row class="my-12">
        <v-col cols="12" :md="8" class="mx-auto">
          <h1 class="text-center text-purple-darken-3">Frequently Asked Questions</h1>
          <v-divider class="border-opacity-50 mb-6" color="purple-darken-3"></v-divider>

          <v-expansion-panels v-model="panel" multiple variant="accordion">
            <v-expansion-panel v-for="(item, i) in faqItems" :key="i" elevation="0" class="mb-2">
              <v-expansion-panel-title class="text-purple-darken-2 font-weight-medium">
                {{ item.question }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                {{ item.answer }}
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>

      <!-- Call To Action Section -->
      <v-sheet color="purple-lighten-4" class="py-10 my-12">
        <v-container>
          <v-row justify="center" align="center">
            <v-col cols="12" md="8" class="text-center">
              <h2 class="text-h3 text-purple-darken-3 font-weight-bold mb-4">
                Ready to Experience MotoGo?
              </h2>
              <p class="text-h6 text-white-darken-2 mb-6">
                Download our app today and enjoy your first ride with a special discount!
              </p>
              <v-row justify="center">
                <v-col cols="auto">
                  <v-btn size="x-large" color="black" variant="outlined">
                    <v-icon start>mdi-apple</v-icon>
                    App Store
                  </v-btn>
                </v-col>
                <v-col cols="auto">
                  <v-btn size="x-large" color="black" variant="outlined">
                    <v-icon start>mdi-google-play</v-icon>
                    Google Play
                  </v-btn>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>

      <!-- Enhanced Footer with purple-lighten-4 hover effect -->
      <v-footer height="auto" class="pa-4 text-center" color="white">
        <v-container>
          <v-row justify="center">
            <v-col cols="12" md="4">
              <!-- <h3 class="text-white font-weight-bold">MotoGo</h3> -->
              <img src="/images/motoGO.png" width="90px" />
              <p class="text-white-darken-2 mt-2">
                Your trusted ride-hailing service. Making transportation accessible, affordable, and
                safe.
              </p>
            </v-col>
            <v-col cols="12" md="4">
              <h2 class="text-purple font-weight-large">Quick Links</h2>
              <v-divider></v-divider>
              <v-list density="compact" bg-color="transparent">
                <v-list-item title="About Us" class="text-purple"></v-list-item>
                <v-list-item title="Services" class="text-purple"></v-list-item>
                <v-list-item title="Become a Driver" class="text-purple"></v-list-item>
                <v-list-item title="Contact" class="text-purple"></v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="4">
              <h2 class="text-purple font-weight-bold">Contact Us</h2>
              <p class="text-white-darken-2">
                <v-icon color="purple-darken-3" class="mr-2">mdi-email</v-icon>
                MotoGOSupport@gmail.com
              </p>
              <p class="text-white-darken-2">
                <v-icon color="purple-darken-3" class="mr-2">mdi-phone</v-icon> 09851726699
              </p>
            </v-col>
          </v-row>

          <v-divider color="purple-darken-3" class="my-4"></v-divider>

          <v-row justify="center">
            <v-col cols="12">
              <p class="text-white-darken-2">
                © {{ new Date().getFullYear() }} MotoGo. All rights reserved.
              </p>
            </v-col>
          </v-row>

          <v-row justify="center" class="mt-3">
            <v-hover v-slot:default="{ isHovering, props }">
              <v-btn
                icon
                variant="text"
                color="white"
                href="https://facebook.com"
                target="_blank"
                v-bind="props"
                :style="{
                  backgroundColor: isHovering
                    ? 'rgb(209, 196, 233)'
                    : 'transparent' /* purple-lighten-4 */,
                  transition: 'background-color 0.3s ease',
                }"
              >
                <v-icon color="purple-darken-3">mdi-facebook</v-icon>
              </v-btn>
            </v-hover>

            <v-hover v-slot:default="{ isHovering, props }">
              <v-btn
                icon
                variant="text"
                color="white"
                href="https://twitter.com"
                target="_blank"
                v-bind="props"
                :style="{
                  backgroundColor: isHovering
                    ? 'rgb(209, 196, 233)'
                    : 'transparent' /* purple-lighten-4 */,
                  transition: 'background-color 0.3s ease',
                }"
              >
                <v-icon color="purple-darken-3">mdi-twitter</v-icon>
              </v-btn>
            </v-hover>

            <v-hover v-slot:default="{ isHovering, props }">
              <v-btn
                icon
                variant="text"
                color="white"
                href="mailto:info@motogo.com"
                v-bind="props"
                :style="{
                  backgroundColor: isHovering
                    ? 'rgb(209, 196, 233)'
                    : 'transparent' /* purple-lighten-4 */,
                  transition: 'background-color 0.3s ease',
                }"
              >
                <v-icon color="purple-darken-3">mdi-email</v-icon>
              </v-btn>
            </v-hover>

            <v-hover v-slot:default="{ isHovering, props }">
              <v-btn
                icon
                variant="text"
                color="white"
                href="https://instagram.com"
                target="_blank"
                v-bind="props"
                :style="{
                  backgroundColor: isHovering
                    ? 'rgb(209, 196, 233)'
                    : 'transparent' /* purple-lighten-4 */,
                  transition: 'background-color 0.3s ease',
                }"
              >
                <v-icon color="purple-darken-3">mdi-instagram</v-icon>
              </v-btn>
            </v-hover>
          </v-row>
        </v-container>
      </v-footer>
    </template>
  </DashboardLayout>
</template>

<style scoped>
.bg-logo {
  background-image: url('/images/1100000.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  height: 400px;
  width: 100%;
}

.carousel-gradient {
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0) 100%
  );
  height: 100%;
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
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.custom-slide-item:hover {
  transform: translateY(-5px);
}

@media (max-width: 768px) {
  .custom-slide-item {
    height: 250px;
    width: 250px;
  }
}

.responsive-image.hover-effect {
  transform: scale(1.05);
  filter: brightness(1.1);
  transition: all 0.4s ease;
}

.voucher-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 60%,
    transparent 100%
  );
  height: 60%;

  width: 100%;
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

.border-color {
  border: 2px solid #e1bee7;
  transition: box-shadow 0.3s ease;
}

.border-color:hover {
  box-shadow: 0 4px 12px rgba(123, 31, 162, 0.15);
}

.review-card {
  border: 1px solid #e1bee7;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.review-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(123, 31, 162, 0.15);
  border-color: #ba68c8;
}
</style>
