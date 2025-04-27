<script setup></script>
<template>
  <v-container>
    <v-row
      ><v-col cols="12" class="d-flex justify-center">
        <img src="/images/ops10.png" width="700px" /> </v-col
    ></v-row>
    <v-row
      ><v-col cols="12">
        <h1 class="d-flex justify-center title-forbid">Access Denied...</h1>
        <div class="d-flex justify-center sub-forbid">
          <h2>You don't have permission to access this page.</h2>
        </div>
        <br />
        <div class="d-flex justify-center">
          <v-btn class="back-button"> <v-icon start>mdi-arrow-left</v-icon>Back to Home</v-btn>
        </div>
      </v-col></v-row
    >
  </v-container>
</template>
<style>
.title-forbid {
  font-size: 50px;
  color: purple;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
.sub-forbid {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>
