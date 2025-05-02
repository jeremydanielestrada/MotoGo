<script setup>
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'
</script>

<template>
  <v-container>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="6" md="5" lg="5">
        <template v-slot="title">
          <v-row>
            <v-col cols="12">
              <h1 class="font-weight-bold title-name">
                <v-icon class="icon-image" icon="mdi-racing-helmet"></v-icon>MotoGo
              </h1>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" align="center"><h1 class="tagline">Ride Smart, Ride Safe</h1></v-col>
          </v-row>
          <v-row>
            <img class="image-logo" src="/images/logo11.png" width="95%" />
          </v-row>
        </template>
      </v-col>
      <br />
      <v-col cols="2"></v-col>
      <v-col cols="12" sm="8" md="6" lg="4">
        <div class="card-con" elevate="10">
          <v-card-title>
            <h2 align="center">Join the Ride now!</h2>
          </v-card-title>
          <v-card-text>
            <br />
            <h3 align="center">Already have an account?</h3>
            <LoginForm></LoginForm>
            <h3 align="center">Don't have an account?</h3>
            <RegisterForm></RegisterForm>
          </v-card-text>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.icon-image {
  color: #8e24aa;
}

.title-name {
  font-size: 3.5rem;

  text-align: center;
}

.tagline {
  font-style: oblique;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 1.5rem;
}

.image-logo {
  padding-left: 20px;
}
.card-con {
  background-color: #e1bee7;
  border-radius: 10px;
  /* border: 1px solid #ba68c8; */
  box-shadow:
    inset 0 0 10px #f6e8f8,
    0 0 10px #c39dca,
    0 5px 10px #7e1791;
}
.title-card {
  background-color: #ba68c8;
}
</style>
