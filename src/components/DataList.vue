<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        ข้อมูลที่ Cache ไว้
      </h2>
      
      <!-- Search and Filter -->
      <div class="flex flex-col lg:flex-row gap-4 mb-4">
        <div class="form-control flex-1">
          <div class="input-group">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="ค้นหาข้อมูล..." 
              class="input input-bordered w-full"
            />
            <button class="btn btn-square">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="form-control">
          <select v-model="selectedCategory" class="select select-bordered">
            <option value="ทั้งหมด">ทั้งหมด</option>
            <option value="ข่าว">ข่าว</option>
            <option value="เทคโนโลยี">เทคโนโลยี</option>
            <option value="กีฬา">กีฬา</option>
            <option value="บันเทิง">บันเทิง</option>
            <option value="สุขภาพ">สุขภาพ</option>
          </select>
        </div>
      </div>
      
      <!-- Data List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-if="filteredData.length === 0" class="col-span-full text-center py-8">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="text-gray-500">ไม่พบข้อมูลที่ค้นหา</p>
        </div>
        
        <div 
          v-for="item in paginatedData" 
          :key="item.id"
          class="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="card-body p-4">
            <!-- Image -->
            <div class="aspect-video w-full mb-4 rounded-lg overflow-hidden">
              <img 
                :src="item.imageUrl" 
                :alt="item.title"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            
            <!-- Title and Category -->
            <div class="flex justify-between items-start mb-2">
              <h3 class="card-title text-lg leading-tight">{{ item.title }}</h3>
              <div class="badge badge-primary">{{ item.category }}</div>
            </div>
            
            <!-- Content -->
            <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ item.content }}</p>
            
            <!-- Author and Stats -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="avatar placeholder">
                  <div class="bg-neutral text-neutral-content rounded-full w-6">
                    <span class="text-xs">{{ item.author.charAt(0) }}</span>
                  </div>
                </div>
                <span class="text-xs text-gray-500">{{ item.author }}</span>
              </div>
              
              <div class="flex items-center gap-3 text-xs text-gray-500">
                <div class="flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  {{ item.views.toLocaleString() }}
                </div>
                <div class="flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  {{ item.likes }}
                </div>
              </div>
            </div>
            
            <!-- Timestamp -->
            <div class="flex justify-between items-center text-xs text-gray-500">
              <span>ID: {{ item.id }}</span>
              <span>{{ formatDateTime(item.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="filteredData.length > 0" class="flex justify-center mt-6">
        <div class="btn-group">
          <button 
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="btn btn-sm"
          >
            «
          </button>
          <button class="btn btn-sm btn-active">
            หน้า {{ currentPage }} จาก {{ totalPages }}
          </button>
          <button 
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="btn btn-sm"
          >
            »
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCache, type CacheData } from '../composables/useCache'

const { cachedData, filterByCategory, searchData } = useCache()

// State
const searchQuery = ref('')
const selectedCategory = ref('ทั้งหมด')
const currentPage = ref(1)
const itemsPerPage = 9

// Computed
const filteredData = computed(() => {
  let data: CacheData[] = cachedData.value
  
  // Filter by category
  if (selectedCategory.value !== 'ทั้งหมด') {
    data = filterByCategory(selectedCategory.value)
  }
  
  // Search
  if (searchQuery.value.trim()) {
    data = searchData(searchQuery.value)
  }
  
  return data
})

const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / itemsPerPage)
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredData.value.slice(start, end)
})

// Format datetime
const formatDateTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Watch for changes
watch([searchQuery, selectedCategory], () => {
  currentPage.value = 1
})
</script>
