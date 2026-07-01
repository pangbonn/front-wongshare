<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
        </svg>
        ระบบ Cache ข้อมูล
      </h2>
      
      <!-- Cache Statistics -->
      <div class="stats stats-vertical lg:stats-horizontal shadow">
        <div class="stat">
          <div class="stat-title">จำนวนข้อมูล</div>
          <div class="stat-value text-primary">{{ stats?.totalItems || 0 }}</div>
          <div class="stat-desc">รายการ</div>
        </div>
        
        <div class="stat">
          <div class="stat-title">อัปเดตล่าสุด</div>
          <div class="stat-value text-secondary">{{ formatTime(stats?.lastUpdated) }}</div>
          <div class="stat-desc">นาทีที่แล้ว</div>
        </div>
        
        <div class="stat">
          <div class="stat-title">พื้นที่ใช้</div>
          <div class="stat-value text-accent">{{ stats?.storageUsed || '0 KB' }}</div>
          <div class="stat-desc">localStorage</div>
        </div>
      </div>
      
      <!-- Cache Controls -->
      <div class="card-actions justify-end">
        <button 
          @click="refreshData" 
          :disabled="isLoading"
          class="btn btn-primary"
        >
          <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          {{ isLoading ? 'กำลังโหลด...' : 'รีเฟรชข้อมูล' }}
        </button>
        
        <button 
          @click="clearCache" 
          class="btn btn-error btn-outline"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          ล้าง Cache
        </button>
      </div>
      
      <!-- Cache Status -->
      <div class="alert" :class="cacheStatusClass">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h3 class="font-bold">{{ cacheStatusTitle }}</h3>
          <div class="text-xs">{{ cacheStatusMessage }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useCache, type CacheStats } from '../composables/useCache'

const { refreshData, clearCache, getCacheStats, isLoading } = useCache()
const stats = ref<CacheStats | null>(null)

// Update stats
const updateStats = () => {
  stats.value = getCacheStats()
}

// Format time
const formatTime = (timestamp?: number): string => {
  if (!timestamp) return '0'
  const minutes = Math.floor((Date.now() - timestamp) / (1000 * 60))
  return minutes.toString()
}

// Cache status
const cacheStatusClass = computed(() => {
  if (isLoading.value) return 'alert-info'
  if (stats.value && stats.value.totalItems > 0) return 'alert-success'
  return 'alert-warning'
})

const cacheStatusTitle = computed(() => {
  if (isLoading.value) return 'กำลังโหลดข้อมูล...'
  if (stats.value && stats.value.totalItems > 0) return 'ข้อมูลถูก cache แล้ว'
  return 'ยังไม่มีข้อมูลใน cache'
})

const cacheStatusMessage = computed(() => {
  if (isLoading.value) return 'กรุณารอสักครู่'
  if (stats.value && stats.value.totalItems > 0) {
    return `ข้อมูล ${stats.value.totalItems} รายการ พร้อมใช้งาน - เปลี่ยนหน้าในเว็บไม่ต้องโหลดใหม่`
  }
  return 'คลิกปุ่ม "รีเฟรชข้อมูล" เพื่อโหลดข้อมูลครั้งแรก'
})

// Handle refresh
// const handleRefresh = async () => {
//   await refreshData()
//   updateStats()
// }

// Handle clear
// const handleClear = () => {
//   if (confirm('คุณแน่ใจหรือไม่ที่จะล้างข้อมูลทั้งหมดใน cache?')) {
//     clearCache()
//     updateStats()
//   }
// }

onMounted(() => {
  updateStats()
})
</script>
