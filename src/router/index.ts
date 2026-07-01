import { createRouter, createWebHistory, type RouteLocationNormalized, type NavigationGuardNext } from 'vue-router'
import Home from '../views/Home.vue'
import ArticleDetail from '../views/ArticleDetail.vue'
import EmailSettings from '../views/EmailSettings.vue'
import { handleAuthCallback } from './auth-callback'

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
  routes
})

export default router
