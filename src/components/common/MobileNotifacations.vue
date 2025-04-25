<script setup>
import DashboardLayout from '../layout/dashboards/DashboardLayout.vue'
import { ref } from 'vue'
const items = ref([
  { title: 'Rider Name', text: 'Ride Was Canelled' },
  { title: 'Notif 2' },
  { title: 'Notif 3' },
])
</script>

<template>
  <DashboardLayout>
    <template #content>
      <v-row>
        <v-col cols="12" md="12" sm="12" width="100%">
          <!-- Notification Button and Menu -->
          <div width="100%">
            <v-list class="overflow-y-auto" style="max-height: 400px">
              <h3 class="text-h6">Notifications</h3>
              <v-list-item
                v-for="(item, index) in items"
                :key="index"
                :value="index"
                class="border-thin"
              >
                <v-list-item-title
                  ><b>{{ item.title }}</b></v-list-item-title
                >
                <span> {{ item.text }}</span>
              </v-list-item>
            </v-list>
          </div>
        </v-col>
      </v-row>
    </template>
  </DashboardLayout>
</template>
