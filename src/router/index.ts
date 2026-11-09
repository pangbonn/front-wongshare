import { createRouter, createWebHistory, type RouteLocationNormalized, type NavigationGuardNext } from 'vue-router'
import Home from '../views/Home.vue'
import ArticleDetail from '../views/ArticleDetail.vue'
import EmailSettings from '../views/EmailSettings.vue'
import { handleAuthCallback } from './auth-callback'
import { HEADER_OFFSET } from '../utils/scroll'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: ArticleDetail,
    props: true
  },
  {
    path: '/subscribe/confirm/:token',
    name: 'SubscribeConfirm',
    component: () => import('../views/SubscriptionStatus.vue'),
    props: (route: RouteLocationNormalized) => ({ action: 'confirm', token: route.params.token })
  },
  {
    path: '/unsubscribe/:token',
    name: 'Unsubscribe',
    component: () => import('../views/SubscriptionStatus.vue'),
    props: (route: RouteLocationNormalized) => ({ action: 'unsubscribe', token: route.params.token })
  },
  {
    path: '/settings/email',
    name: 'EmailSettings',
    component: EmailSettings
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: Home, // Temporary component to satisfy router requirements
    beforeEnter: async (_to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
      const result = await handleAuthCallback()
      if (result.success) {
        next('/')
      } else {
        next('/?error=auth_failed')
      }
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      // Article content may not be rendered yet; ArticleDetail scrolls once headings exist.
      const el = document.getElementById(to.hash.slice(1))
      return el ? { el, top: HEADER_OFFSET, behavior: 'smooth' } : false
    }
    if (to.path !== from.path) return { top: 0 }
    return false
  }
})

export default router
