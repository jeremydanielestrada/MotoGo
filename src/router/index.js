import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import DriverRegistrationView from '@/views/auth/DriverRegistrationView.vue'
import HomeView from '@/views/auth/HomeView.vue'
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
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/driver-register',
      name: 'register as driver',
      component: DriverRegistrationView,
    },

    {
      path: '/home',
      name: 'Home',
      component: HomeView,
    },
    {
      path: '/message',
      name: 'Messages',
      component: MessageView,
    },
  ],
})

export default router
