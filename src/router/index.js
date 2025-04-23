import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import PassengerDashboard from '@/components/system/dashboard/PassengerDashboard.vue'
import MessageView from '@/views/auth/MessageView.vue'
import Bookings from '@/components/system/transactions/Bookings.vue'
import RiderDashboard from '@/components/system/dashboard/RiderDashboard.vue'
import MobileNotifacations from '@/components/common/MobileNotifacations.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },

    {
      path: '/passenger-dashboard',
      name: 'PassengerDashboard',
      component: PassengerDashboard,
    },
    {
      path: '/message',
      name: 'Messages',
      component: MessageView,
    },
    {
      path: '/bookings',
      name: 'bookings',
      component: Bookings,
    },

    {
      path: '/rider-dashboard',
      name: 'RiderDashboard',
      component: RiderDashboard,
    },

    {
      path: '/mobile-notifications',
      name: 'MobileNotifacations',
      component: MobileNotifacations,
    },
  ],
})

export default router
