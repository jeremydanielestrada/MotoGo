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
      path: '/system/rider-dashboard',
      name: 'RiderDashboard',
      component: RiderDashboard,
    },

    {
      path: '/mobile-notifications',
      name: 'MobileNotifacations',
      component: MobileNotifacations,
    },

    {
      path: '/not-found',
      name: 'not-found',
      component: NotFoundView,
    },

    {
      path: '/forbidden',
      name: 'forbidden',
      component: ForbiddenView,
    },
  ],
})

router.beforeEach(async (to) => {
  const isLoggedIn = await isAuthenticated()
  const userMetaData = await getuserInformation()

  const isAdmin = userMetaData?.is_admin === true

  //redirect to  appropriate page if accessing the home route
  // if (to.name === 'home') {
  //   return isLoggedIn ? { name: 'PassengerDashboard' } : { name: 'home' }
  // } else if (to.name === 'home') {
  //   return isLoggedIn ? { name: 'RiderDashboard' } : { name: 'home' }
  // }

  //check if the user is logged in
  // if (isLoggedIn && to.name === 'home') {
  //   return [{ name: 'PassengerDashboard' }, { name: 'RiderDashboard' }]
  // }

  //check if the user is logged in and is an admin
  // if (isLoggedIn && !isAdmin) {
  //   //check if the user is going to forbidden pages
  //   if (to.name.startsWith('system/users')) {
  //     return { name: 'forbidden' }
  //   }
  // }

  //if not logged in and going to system pages
  // if (!isLoggedIn && to.path.startsWith('/system')) {
  //   return { name: 'home' }
  // }

  //redirect to 404 not found if the rooute  does not exist
  // if (router.resolve(to).matched.length === 0) {
  //   return { name: 'not-found' }
  // }

  // Redirect from home based on role
  if (to.name === 'home') {
    if (!isLoggedIn) {
      return true // Allow access to login page
    } else if (isAdmin) {
      return { name: 'RiderDashboard' }
    } else {
      return { name: 'PassengerDashboard' }
    }
  }

  // Block access to /system/* if not logged in
  if (!isLoggedIn && to.path.startsWith('/system')) {
    return { name: 'home' }
  }

  // Block non-admin users from admin pages
  if (isLoggedIn && !isAdmin && to.name?.startsWith('system/users')) {
    return { name: 'forbidden' }
  }

  // 404 fallback
  if (router.resolve(to).matched.length === 0) {
    return { name: 'not-found' }
  }

  return true // Always allow if no redirects are needed
})

export default router
