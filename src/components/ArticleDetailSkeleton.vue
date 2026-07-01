<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
    <!-- Header Skeleton -->
    <div class="mb-6 sm:mb-8">
      <div class="flex items-center gap-3 mb-4">
        <!-- Profile Image Skeleton -->
        <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        <div class="space-y-2">
          <div class="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div class="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
      
      <!-- Title Skeleton -->
      <div class="space-y-3 mb-6">
        <div class="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div class="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      
      <!-- Meta Info Skeleton -->
      <div class="flex items-center gap-4 mb-6">
        <div class="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div class="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div class="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    </div>
    
    <!-- Main Image Skeleton -->
    <div class="w-full h-64 sm:h-80 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-6 sm:mb-8"></div>
    
    <!-- Content Skeleton -->
    <div class="space-y-4 mb-8">
      <div class="space-y-2">
        <div class="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div class="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div class="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      <div class="space-y-2">
        <div class="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div class="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      <div class="space-y-2">
        <div class="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div class="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div class="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    </div>
    
    <!-- Action Buttons Skeleton -->
    <div class="flex items-center gap-4 mb-8">
      <div class="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      <div class="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      <div class="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
    </div>
    
    <!-- Related Articles Skeleton -->
    <div class="mt-12 sm:mt-16">
      <div class="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4 sm:mb-6"></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div v-for="n in 4" :key="n" class="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg">
          <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex-shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div class="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div class="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div class="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props or logic needed for skeleton component
</script>
