<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
    <SplashScreen />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import SplashScreen from './components/SplashScreen.vue'
import { useCache } from './composables/useCache'
import { useTheme } from './composables/useTheme'

const { initializeCache } = useCache()
const { initTheme } = useTheme()

onMounted(async () => {
  initTheme()
  await initializeCache()
})
</script>
