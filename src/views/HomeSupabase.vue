<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <Header />

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div class="flex flex-col lg:flex-row gap-4 lg:gap-8">
        <!-- Left Content -->
        <div class="flex-1 max-w-4xl">
          <!-- Tabs -->
          <div class="sticky top-0 z-10 bg-white flex space-x-4 sm:space-x-8 mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto scrollbar-hide py-2">
            <button 
              @click="setActiveTab('all')"
              :disabled="loading"
              :class="[
                'pb-3 sm:pb-4 text-sm font-medium whitespace-nowrap transition-all duration-200',
                loading ? 'opacity-50 cursor-not-allowed' : '',
                activeTab === 'all' 
                  ? 'text-black border-b-2 border-black' 
                  : 'text-gray-500 hover:text-gray-700'
              ]"
            >
              ทั้งหมด
            </button>
            <button 
              v-for="category in categories" 
              :key="category.id"
              @click="setActiveTab(category.slug)"
              :disabled="loading"
              :class="[
                'pb-3 sm:pb-4 text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2',
                loading ? 'opacity-50 cursor-not-allowed' : '',
                activeTab === category.slug 
                  ? 'text-black border-b-2 border-black' 
                  : 'text-gray-500 hover:text-gray-700'
              ]"
            >
              <span v-if="category.icon">{{ category.icon }}</span>
              {{ category.name }}
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="loading && articles.length === 0" class="space-y-4">
            <div v-for="n in 3" :key="n" class="animate-pulse">
              <div class="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="error && articles.length === 0" class="text-center py-12">
            <p class="text-red-500">{{ error }}</p>
            <button @click="loadArticles" class="mt-4 btn btn-primary">
              ลองอีกครั้ง
            </button>
          </div>

          <!-- Articles -->
          <div v-else class="space-y-4 sm:space-y-8">
            <article 
              v-for="article in articles" 
              :key="article.id"
              class="flex flex-col sm:flex-row gap-4 sm:gap-6 cursor-pointer hover:bg-gray-50 p-3 sm:p-4 rounded-lg transition-all duration-200"
              @click="goToArticle(article.slug || article.id)"
            >
              <div class="flex-1 order-2 sm:order-1">
                <div class="flex items-center gap-2 mb-2">
                  <img 
                    v-if="article.author?.avatar_url"
                    :src="article.author.avatar_url" 
                    :alt="article.author.name || 'Author'" 
                    class="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                  />
                  <span class="text-xs sm:text-sm text-gray-600">
                    {{ article.author?.name || 'Unknown' }}
                  </span>
                </div>
                <h2 class="text-lg sm:text-xl font-bold text-black mb-2 hover:text-gray-700 line-clamp-2">
                  {{ article.title }}
                </h2>
                <p class="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
                  {{ article.excerpt || article.content?.substring(0, 150) + '...' }}
                </p>
                <div class="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-2 flex-wrap">
                  <span v-if="article.category" class="flex items-center gap-1">
                    <span v-if="article.category.icon">{{ article.category.icon }}</span>
                    {{ article.category.name }}
                  </span>
                  <span>{{ formatDate(article.published_at || article.created_at) }}</span>
                  <span>❤️ {{ formatNumber(article.likes_count) }}</span>
                  <span>👁️ {{ formatNumber(article.views_count) }}</span>
                </div>
                <!-- Tags -->
                <div v-if="article.tags && article.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
                  <span 
                    v-for="tag in article.tags.slice(0, 3)" 
                    :key="tag.id"
                    class="badge badge-sm"
                    :style="{ 
                      backgroundColor: tag.color ? tag.color + '20' : '#f3f4f6',
                      color: tag.color || '#374151',
                      borderColor: tag.color || '#e5e7eb'
                    }"
                  >
                    <span v-if="tag.icon">{{ tag.icon }}</span>
                    {{ tag.name }}
                  </span>
                  <span v-if="article.tags.length > 3" class="badge badge-sm badge-ghost">
                    +{{ article.tags.length - 3 }}
                  </span>
                </div>
              </div>
              <div class="w-full sm:w-32 h-48 sm:h-32 bg-gray-200 rounded-lg flex-shrink-0 relative overflow-hidden order-1 sm:order-2">
                <img 
                  v-if="article.cover_image_url"
                  :src="article.cover_image_url" 
                  :alt="article.title" 
                  class="w-full h-full object-cover rounded-lg"
                >
                <div v-else class="w-full h-full flex items-center justify-center bg-gray-200">
                  <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
              </div>
            </article>
          </div>

          <!-- Load More Button -->
          <div v-if="hasMore" class="text-center py-6 sm:py-8">
            <button 
              @click="loadMore"
              :disabled="loading"
              class="btn btn-outline"
            >
              <span v-if="loading" class="loading loading-spinner loading-sm"></span>
              {{ loading ? 'กำลังโหลด...' : 'โหลดเพิ่มเติม' }}
            </button>
          </div>
        </div>

        <!-- Right Sidebar -->
        <div class="w-full lg:w-80 space-y-6">
          <!-- Recommended Articles -->
          <div v-if="recommendedArticles.length > 0" class="bg-gray-50 rounded-lg p-4">
            <h3 class="font-semibold mb-4">บทความแนะนำ</h3>
            <div class="space-y-4">
              <div 
                v-for="rec in recommendedArticles" 
                :key="rec.id"
                @click="goToArticle(rec.slug || rec.id)"
                class="cursor-pointer hover:bg-white p-2 rounded transition"
              >
                <h4 class="font-medium text-sm line-clamp-2">{{ rec.title }}</h4>
                <p class="text-xs text-gray-500 mt-1">{{ formatDate(rec.published_at || rec.created_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import { useArticles } from '@/composables/useArticles'
import { useCategories } from '@/composables/useCategories'

const router = useRouter()

// Composables
const { 
  articles, 
  loading, 
  error, 
  fetchArticles, 
  fetchArticlesByCategory 
} = useArticles()

const { categories, fetchCategories } = useCategories()

// State
const activeTab = ref('all')
const currentPage = ref(0)
const hasMore = ref(true)
const articlesPerPage = 10
const recommendedArticles = ref<any[]>([])

// Format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

// Format number
const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Set active tab
const setActiveTab = async (tab: string) => {
  activeTab.value = tab
  currentPage.value = 0
  await loadArticles()
}

// Load articles
const loadArticles = async () => {
  try {
    const offset = currentPage.value * articlesPerPage
    
    let result
    if (activeTab.value === 'all') {
      result = await fetchArticles({ limit: articlesPerPage, offset })
    } else {
      result = await fetchArticlesByCategory(activeTab.value, articlesPerPage, offset)
    }
    
    hasMore.value = result.hasMore
  } catch (err) {
    console.error('Error loading articles:', err)
  }
}

// Load more articles
const loadMore = async () => {
  currentPage.value++
  await loadArticles()
}

// Go to article
const goToArticle = (identifier: string | number) => {
  router.push(`/article/${identifier}`)
}

// Initialize
onMounted(async () => {
  await Promise.all([
    fetchCategories(),
    loadArticles()
  ])
})
</script>

