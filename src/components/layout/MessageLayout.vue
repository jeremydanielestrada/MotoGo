<script setup>
import { ref, watch, onMounted } from 'vue'
import { useDisplay } from 'vuetify'

const { mdAndUp, smAndDown } = useDisplay()
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
  <v-app>
    <v-app-bar>
      <template v-slot:prepend>
        <v-app-bar-nav-icon
          v-show="smAndDown"
          @click="drawer = !drawer"
          class="me-14"
        ></v-app-bar-nav-icon>
      </template>

      <v-row class="d-flex justify-start align-start mx-auto">
        <v-col cols="12" md="12" sm="12" xs="12">
          <div class="d-flex justify- align-center">
            <img class="mr-2" src="/public/images/motoGO.png" alt="MotoGo Logo" width="40px" />
            <h1 class="text-italic text-purple-darken-3">MotoGo</h1>
          </div>
        </v-col>
      </v-row>
      <v-spacer></v-spacer>

      <!-- <v-icon class="mx-10" v-show="mdAndUp" size="40" @click="showFormModal = true"
        >mdi-account-circle-outline</v-icon
      > -->
    </v-app-bar>

    <v-navigation-drawer
      v-if="smAndDown"
      v-model="drawer"
      :location="smAndDown ? 'left' : null"
      :width="250"
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
