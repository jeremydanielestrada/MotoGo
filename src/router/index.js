import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import PassengerDashboard from '@/components/system/dashboard/PassengerDashboard.vue'
import MessageView from '@/views/auth/MessageView.vue'
import Bookings from '@/components/system/transactions/Bookings.vue'
import RiderDashboard from '@/components/system/dashboard/RiderDashboard.vue'
import MobileNotifacations from '@/components/common/MobileNotifacations.vue'
import { isAuthenticated, getuserInformation } from '@/utils/supabase'
import NotFoundView from '@/views/errors/NotFoundView.vue'
import ForbiddenView from '@/views/errors/ForbiddenView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LoginView,
    },

    {
      path: '/system/passenger-dashboard',
      name: 'PassengerDashboard',
      component: PassengerDashboard,
      meta: { requiresAuth: true },
    },
    {
      path: '/message',
      name: 'Messages',
      component: MessageView,
      meta: { requiresAuth: true },
    },
    {
      path: '/bookings',
      name: 'bookings',
      component: Bookings,
      meta: { requiresAuth: true },
    },

    {
      path: '/system/rider-dashboard',
      name: 'RiderDashboard',
      component: RiderDashboard,
      meta: { requiresAuth: true, requiresDriver: true },
    },

    {
      path: '/mobile-notifications',
      name: 'MobileNotifacations',
      component: MobileNotifacations,
      meta: { requiresAuth: true },
    },
    {
      path: '/:catchAll(.*)',
      component: NotFoundView,
    },

    {
      path: '/forbidden',
      name: 'forbidden',
      component: ForbiddenView,
    },
  ],
})

//navigation guard
router.beforeEach(async (to) => {
  const isLoggedIn = await isAuthenticated()

  if (to.name === 'home' && isLoggedIn) {
    return isDriver ? { name: 'RiderDashboard' } : { name: 'PassengerDashboard' }
  }

  if (!isLoggedIn) {
    // If route requires auth but user is not logged in
    if (to.meta.requiresAuth) {
      return { name: 'home' }
    }

    // Let them go to public routes (like login)
    return true
  }

  // If logged in, fetch user metadata
  const userMetaData = await getuserInformation()
  const isAdmin = userMetaData?.is_admin === true
  const isDriver = userMetaData?.is_driver === true

  // If going to home ("/") and already logged in, redirect based on role
  if (to.name === 'home') {
    return isDriver ? { name: 'RiderDashboard' } : { name: 'PassengerDashboard' }
  }

  // If route requires admin but user is not admin
  if (to.meta.requiresAdmin && !isAdmin) {
    return { name: 'forbidden' }
  }

  // If route requires driver but user is not driver
  if (to.meta.requiresDriver && !isDriver) {
    return { name: 'forbidden' }
  }

  // Everything is okay
  return true
})

export default router
