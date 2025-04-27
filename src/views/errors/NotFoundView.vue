<script setup></script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="d-flex justify-center">
        <img src="/images/ops7.png" width="700px" />
      </v-col>
      <v-col cols="12">
        <div>
          <h1 class="oops-title d-flex justify-center">Oops! Page Not Found</h1>

          <div>
            <h2 class="Sub-name d-flex justify-center">
              We can't seem to find the page you're looking for.
            </h2>
            <br />
            <div class="d-flex justify-center">
              <v-btn class="back-button"> <v-icon start>mdi-arrow-left</v-icon>Back to Home</v-btn>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
<style>
.oops-title {
  font-size: 50px;
  align-items: center;
  color: purple;
}

.Sub-name {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
.back-button {
  background-color: #ba68c8 !important;
  color: white !important;
  border: 2px solid #ba68c8 !important;
  border-radius: 15px !important;
}
</style>
