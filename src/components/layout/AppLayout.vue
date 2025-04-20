<script setup>
import { ref, watch, onMounted } from 'vue'
import { useDisplay } from 'vuetify'

const { mdAndUp, smAndDown } = useDisplay()
const theme = ref(localStorage.getItem('theme') ?? 'light')
const drawer = ref(false)

function onClick() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('theme', theme.value)
}

onMounted(() => {
  drawer.value = false // Always start with drawer closed
})

watch(
  mdAndUp,
  (isDesktop) => {
    if (isDesktop) {
      drawer.value = false // Always close drawer on desktop
    }
  },
  { immediate: true },
)
</script>

<template>
  <v-app :theme="theme">
    <v-app-bar
      height="50"
      :color="theme === 'light' ? 'purple-lighten-1' : 'purple-darken-1'"
      border
    >
      <template v-slot:prepend>
        <v-app-bar-nav-icon v-show="smAndDown" @click="drawer = !drawer"></v-app-bar-nav-icon>
      </template>

      <div id="nav-items" v-if="mdAndUp">
        <ul class="d-flex align-center mx-10 ga-5">
          <li text to="/" class="">Home</li>
          <li text to="/about" class="">About</li>
          <li text to="/contact" class="">Contact</li>
        </ul>
      </div>

      <v-spacer></v-spacer>

      <!-- <v-icon class="mx-10" v-show="mdAndUp" size="40" @click="showFormModal = true"
        >mdi-account-circle-outline</v-icon
      > -->
      <v-btn
        :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        slim
        @click="onClick"
      ></v-btn>
    </v-app-bar>

    <v-navigation-drawer
      v-if="smAndDown"
      v-model="drawer"
      :location="smAndDown ? 'left' : null"
      :width="250"
      :color="theme === 'light' ? 'purple-lighten-2' : 'purple-darken-3'"
    >
      <v-list>
        <v-list-item link to="/" title="Home" prepend-icon="mdi-home-circle-outline"></v-list-item>
        <v-list-item
          link
          to="/about"
          title="About"
          prepend-icon="mdi-information-outline"
        ></v-list-item>
        <v-list-item
          link
          to="/contact"
          title="Contact"
          prepend-icon="mdi-card-account-mail-outline"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-account-circle-outline"
          link
          to="/auth/login"
          title="Log in/Sign up"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <slot name="content"></slot>
    </v-main>

    <v-footer border app :color="theme === 'light' ? 'purple-lighten-1' : 'purple-darken-1'">
      new project
    </v-footer>
  </v-app>
</template>

<style>
#nav-items ul {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 1.5rem;
}

#nav-items ul li {
  cursor: pointer;
  margin: 0 1rem;
}

.v-main {
  background-color: var(--v-background);
  min-height: calc(100vh - 104px); /* Subtract header and footer height */
}
</style>
