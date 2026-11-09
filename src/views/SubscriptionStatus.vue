<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
    <Header />

    <div class="max-w-md mx-auto px-4 py-16 text-center">
      <div v-if="status === 'loading'" class="flex justify-center">
        <svg class="w-8 h-8 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>

      <template v-else>
        <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{{ copy.title }}</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">{{ copy.message }}</p>
        <router-link
          to="/"
          class="inline-block px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
        >
          กลับหน้าแรก
        </router-link>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Header from '../components/Header.vue'
import { confirmSubscription, unsubscribeEmail } from '@/api/blogApi'

// Landing page for the links in subscription emails sent by lab-services:
// /subscribe/confirm/:token and /unsubscribe/:token
const props = defineProps<{
  action: 'confirm' | 'unsubscribe'
  token: string
}>()

const status = ref<'loading' | 'success' | 'error'>('loading')

const copy = computed(() => {
  if (props.action === 'confirm') {
    return status.value === 'success'
      ? { title: 'ยืนยันการติดตามเรียบร้อย', message: 'คุณจะได้รับอีเมลทุกครั้งที่มีบทความใหม่ ยกเลิกได้ทุกเมื่อจากลิงก์ท้ายอีเมล' }
      : { title: 'ลิงก์ยืนยันใช้ไม่ได้', message: 'ลิงก์อาจหมดอายุแล้ว (ใช้ได้ 7 วัน) กรอกอีเมลที่หน้าแรกอีกครั้งเพื่อรับลิงก์ใหม่' }
  }
  return status.value === 'success'
    ? { title: 'ยกเลิกการติดตามแล้ว', message: 'คุณจะไม่ได้รับอีเมลแจ้งบทความใหม่อีก ติดตามใหม่ได้ทุกเมื่อจากหน้าแรก' }
    : { title: 'ไม่พบการติดตามนี้', message: 'อีเมลนี้อาจยกเลิกการติดตามไปแล้ว' }
})

onMounted(async () => {
  try {
    if (props.action === 'confirm') await confirmSubscription(props.token)
    else await unsubscribeEmail(props.token)
    status.value = 'success'
  } catch {
    status.value = 'error'
  }
})
</script>
