<template>
  <div v-if="client && adSlot" class="w-full">
    <p class="text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-1">โฆษณา</p>
    <ins
      class="adsbygoogle block"
      :style="{ display: 'block', minHeight: `${minHeight}px` }"
      :data-ad-client="client"
      :data-ad-slot="adSlot"
      :data-ad-format="format"
      data-full-width-responsive="true"
    />
  </div>

  <!-- Dev-only placeholder so the layout can be checked before AdSense is configured -->
  <div
    v-else-if="isDev"
    class="w-full rounded-xl border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-xs text-gray-400 dark:text-gray-500"
    :style="{ minHeight: `${minHeight}px` }"
  >
    Google Ads ({{ slotEnvName }} ยังไม่ได้ตั้งค่า)
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

const props = withDefaults(defineProps<{
  adSlot?: string
  slotEnvName?: string
  format?: string
  minHeight?: number
}>(), {
  slotEnvName: 'VITE_ADSENSE_SLOT_*',
  format: 'auto',
  minHeight: 250
})

const client = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined
const isDev = import.meta.env.DEV

const SCRIPT_ID = 'adsbygoogle-js'

// AdSense script is loaded once per page; each <ins> then registers itself via push().
const loadScript = () => {
  if (document.getElementById(SCRIPT_ID)) return
  const script = document.createElement('script')
  script.id = SCRIPT_ID
  script.async = true
  script.crossOrigin = 'anonymous'
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`
  document.head.appendChild(script)
}

onMounted(() => {
  if (!client || !props.adSlot) return
  loadScript()
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({})
  } catch (err) {
    console.error('AdSense push failed:', err)
  }
})
</script>
