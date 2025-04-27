import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import MessageView from '@/views/MessageView.vue'
import MobileNotifacations from '@/components/common/MobileNotifacations.vue'
import { isAuthenticated, getuserInformation } from '@/utils/supabase'
import NotFoundView from '@/views/errors/NotFoundView.vue'
import ForbiddenView from '@/views/errors/ForbiddenView.vue'

import EditProfileView from '@/views/auth/EditProfileView.vue'

import PassengerDashboardView from '@/views/dashboard/PassengerDashboardView.vue'
import RiderDashboardView from '@/views/dashboard/RiderDashboardView.vue'
import BookingsView from '@/views/BookingsView.vue'
import HistoryView from '@/views/HistoryView.vue'
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
      component: PassengerDashboardView,
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
      component: BookingsView,
      meta: { requiresAuth: true },
    },

    {
      path: '/system/rider-dashboard',
      name: 'RiderDashboard',
      component: RiderDashboardView,
      meta: { requiresAuth: true, requiresDriver: true },
    },

    {
      path: '/history',
      name: 'History',
      component: HistoryView,
      meta: { requiresAuth: true },
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
    {
      path: '/edit-profile',
      name: 'EditProfile',
      component: EditProfileView,
    },
  ],
})

//navigation guard
router.beforeEach(async (to) => {
  const isLoggedIn = await isAuthenticated()

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

  // If route requires driver but user is not driver, allow admin access
  if (to.meta.requiresDriver && !isDriver && !isAdmin) {
    return { name: 'forbidden' }
  }

  // Everything is okay
  return true
})

export default router
