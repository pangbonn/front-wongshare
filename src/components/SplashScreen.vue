<template>
  <div 
    v-if="showSplash" 
    class="fixed inset-0 z-50 flex items-center justify-center"
    style="background-color: #0070A8"
  >
    <!-- Background Animation -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 text-center">
      <!-- Logo -->
      <div class="mb-8">
        <div class="relative">
          <!-- Logo Image -->
          <div class="w-32 h-32 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl animate-bounce overflow-hidden">
            <img 
              src="/spashscreen.png" 
              alt="WongShare Logo" 
              class="w-24 h-24 object-contain rounded-xl"
            />
          </div>
          
          <!-- Glow Effect -->
          <div class="absolute inset-0 w-32 h-32 mx-auto bg-white/30 rounded-2xl blur-xl animate-pulse"></div>
        </div>
      </div>

      <!-- App Name -->
      <div class="mb-8">
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-2 animate-fade-in">
          WongShare
        </h1>
        <p class="text-white/80 text-lg animate-fade-in delay-300">
          แชร์ข้อมูลได้ทุกที่ ทุกเวลา
        </p>
      </div>

      <!-- Loading Animation -->
      <div class="flex justify-center items-center space-x-2 mb-8">
        <div class="w-3 h-3 bg-white rounded-full animate-bounce"></div>
        <div class="w-3 h-3 bg-white rounded-full animate-bounce delay-100"></div>
        <div class="w-3 h-3 bg-white rounded-full animate-bounce delay-200"></div>
      </div>

      <!-- Loading Text -->
      <p class="text-white/60 text-sm animate-pulse">
        กำลังโหลด...
      </p>
      
      <!-- Version -->
      <div class="mt-4">
        <p class="text-white/40 text-xs">
          เวอร์ชัน 1.0.0
        </p>
      </div>
    </div>

    <!-- Bottom Info -->
    <div class="absolute bottom-8 left-8 right-8 text-center">
      <div class="flex items-center justify-center space-x-4 text-white/60 text-sm">
        <div class="flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          <span>Vue.js 3</span>
        </div>
        <div class="w-1 h-1 bg-white/40 rounded-full"></div>
        <div class="flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
          <span>PWA</span>
        </div>
        <div class="w-1 h-1 bg-white/40 rounded-full"></div>
        <div class="flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
          </svg>
          <span>DaisyUI</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showSplash = ref(true)

onMounted(() => {
  // Hide splash screen after 3 seconds
  setTimeout(() => {
    showSplash.value = false
  }, 3000)
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out forwards;
}

.delay-300 {
  animation-delay: 0.3s;
}
</style>
