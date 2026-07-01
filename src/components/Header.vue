<template>
  <header class="sticky top-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14">
        <!-- Left: back button + logo -->
        <div class="flex items-center gap-3">
          <button
            v-if="showBackButton"
            @click="goBack"
            class="p-1.5 -ml-1 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            aria-label="ย้อนกลับ"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <router-link to="/" class="flex-shrink-0">
            <img src="/navibar.png" alt="WongShare" class="h-9 w-auto" />
          </router-link>
        </div>

        <!-- Right: subscribe + theme toggle -->
        <div class="flex items-center gap-1 sm:gap-2">

          <!-- Subscribe button -->
          <div class="relative">
            <button
              @click="handleSubscribeClick"
              :disabled="subLoading"
              :class="[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                subLoading ? 'opacity-60 cursor-not-allowed' : '',
                isSubscribed
                  ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 group'
                  : 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300'
              ]"
              :aria-label="isSubscribed ? 'ยกเลิกการติดตาม' : 'ติดตามบทความใหม่'"
            >
              <!-- Loading spinner -->
              <svg v-if="subLoading" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <!-- Bell filled (subscribed) -->
              <svg v-else-if="isSubscribed" class="w-3.5 h-3.5 group-hover:hidden" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <!-- X icon (subscribed hover) -->
              <svg v-else-if="isSubscribed" class="w-3.5 h-3.5 hidden group-hover:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              <!-- Bell outline (not subscribed) -->
              <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>

              <span class="hidden sm:inline">
                <span v-if="isSubscribed" class="group-hover:hidden">ติดตามอยู่</span>
                <span v-if="isSubscribed" class="hidden group-hover:inline">ยกเลิก</span>
                <span v-if="!isSubscribed">ติดตาม</span>
              </span>
            </button>

            <!-- Success toast -->
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 scale-95 translate-y-1"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 translate-y-1"
            >
              <div
                v-if="showToast"
                class="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3 z-50"
              >
                <div class="flex items-start gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-green-100 dark:bg-green-950/50 flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">ติดตามสำเร็จ!</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">จะแจ้งเตือนคุณทุกครั้งที่มีบทความใหม่</p>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Dark/Light toggle -->
          <button
            @click="toggleTheme"
            class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            :aria-label="isDark ? 'เปลี่ยนเป็น Light Mode' : 'เปลี่ยนเป็น Dark Mode'"
          >
            <svg v-if="!isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useAuth } from '@/composables/useAuth'
import { useEmailSubscriptions } from '@/composables/useEmailSubscriptions'

defineProps<{ showBackButton?: boolean }>()

const router = useRouter()
const { isDark, toggleTheme } = useTheme()
const { isAuthenticated, signInWithGoogle } = useAuth()
const { emailSubscription, loading: subLoading, fetchEmailSubscription, toggleEmailType } = useEmailSubscriptions()

const showToast = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

const isSubscribed = ref(false)

const syncSubscribed = () => {
  isSubscribed.value = !!(emailSubscription.value?.enabled && emailSubscription.value?.new_articles)
}

const handleSubscribeClick = async () => {
  if (!isAuthenticated.value) {
    await signInWithGoogle()
    return
  }

  if (!emailSubscription.value) {
    await fetchEmailSubscription()
  }

  if (isSubscribed.value) {
    await toggleEmailType('new_articles', false)
    syncSubscribed()
  } else {
    await toggleEmailType('new_articles', true)
    if (!emailSubscription.value?.enabled) {
      await toggleEmailType('enabled', true)
    }
    syncSubscribed()
    if (toastTimer) clearTimeout(toastTimer)
    showToast.value = true
    toastTimer = setTimeout(() => { showToast.value = false }, 3000)
  }
}

watch(emailSubscription, syncSubscribed)
watch(isAuthenticated, async (val) => {
  if (val) await fetchEmailSubscription()
  syncSubscribed()
})

onMounted(async () => {
  if (isAuthenticated.value) {
    await fetchEmailSubscription()
    syncSubscribed()
  }
})

const goBack = () => router.back()
</script>
