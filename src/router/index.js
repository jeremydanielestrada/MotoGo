import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import PassengerDashboard from '@/components/system/dashboard/PassengerDashboard.vue'
import MessageView from '@/views/auth/MessageView.vue'

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
  ],
})

export default router
