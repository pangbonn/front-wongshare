<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
    <Header />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-col lg:flex-row gap-8">

        <!-- Main feed -->
        <div class="flex-1 min-w-0">

          <!-- Category tabs -->
          <div class="sticky top-14 z-10 bg-gray-50 dark:bg-gray-950 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 pb-px transition-colors duration-200">
            <div class="flex space-x-1 overflow-x-auto scrollbar-hide border-b border-gray-200 dark:border-gray-700">
              <button
                @click="setActiveTab('all')"
                :disabled="isLoading"
                :class="[
                  'flex-shrink-0 px-3 py-3 text-sm font-medium transition-colors',
                  isLoading ? 'opacity-40 cursor-not-allowed' : '',
                  activeTab === 'all'
                    ? 'text-gray-900 dark:text-gray-100 border-b-2 border-gray-900 dark:border-gray-100'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                ]"
              >ทั้งหมด</button>

              <button
                v-for="category in categories"
                :key="category.id"
                @click="setActiveTab(category.slug)"
                :disabled="isLoading"
                :class="[
                  'flex-shrink-0 flex items-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors',
                  isLoading ? 'opacity-40 cursor-not-allowed' : '',
                  activeTab === category.slug
                    ? 'text-gray-900 dark:text-gray-100 border-b-2 border-gray-900 dark:border-gray-100'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                ]"
              >
                <Icon v-if="category.icon" :name="category.icon" :size="14" />
                {{ category.name }}
              </button>
            </div>
          </div>

          <!-- Active tag filter -->
          <div v-if="activeTag" class="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>บทความที่มีแท็ก</span>
            <button
              @click="clearTag"
              class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
              aria-label="ล้างตัวกรองแท็ก"
            >
              #{{ activeTag }}
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Skeleton -->
          <div v-if="isLoading" class="mt-4 divide-y divide-gray-200 dark:divide-gray-800">
            <div v-for="n in 5" :key="n" class="py-5">
              <div class="flex gap-4">
                <div class="flex-1 space-y-3">
                  <div class="flex items-center gap-2">
                    <div class="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    <div class="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                  <div class="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div class="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div class="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div class="flex gap-3">
                    <div class="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div class="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
                <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex-shrink-0" />
              </div>
            </div>
          </div>

          <!-- Error -->
          <div v-else-if="error" class="mt-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 flex gap-3">
            <svg class="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="text-sm font-medium text-red-800 dark:text-red-300">โหลดบทความไม่สำเร็จ</p>
              <p class="text-sm text-red-600 dark:text-red-400 mt-1">{{ error }}</p>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else-if="articles.length === 0" class="mt-12 text-center py-16">
            <svg class="mx-auto w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p class="text-gray-500 dark:text-gray-400 font-medium">ยังไม่มีบทความในหมวดหมู่นี้</p>
          </div>

          <!-- Article list -->
          <div v-else class="mt-4 divide-y divide-gray-200 dark:divide-gray-800">
            <article
              v-for="article in articles"
              :key="article.id"
              class="group py-5 cursor-pointer"
              @click="goToArticle(article.slug || article.id)"
            >
              <div class="flex gap-4 sm:gap-6">
                <!-- Text content -->
                <div class="flex-1 min-w-0 flex flex-col gap-1.5">
                  <!-- Author -->
                  <div class="flex items-center gap-2">
                    <img
                      v-if="article.author?.avatar_url"
                      :src="article.author.avatar_url"
                      :alt="article.author.name"
                      class="w-5 h-5 rounded-full object-cover flex-shrink-0"
                    />
                    <div v-else class="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                    <span class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ article.author?.name || 'Unknown' }}</span>
                  </div>

                  <!-- Title -->
                  <h2 class="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors leading-snug">
                    {{ article.title }}
                  </h2>

                  <!-- Excerpt -->
                  <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed hidden sm:block">
                    {{ article.excerpt || article.content?.substring(0, 140) }}
                  </p>

                  <!-- Meta row -->
                  <div class="flex items-center justify-between mt-1">
                    <div class="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 flex-wrap">
                      <span
                        v-if="article.category"
                        class="flex items-center gap-1 font-medium"
                        :style="{ color: article.category.color || undefined }"
                      >
                        <Icon v-if="article.category.icon" :name="article.category.icon" :size="12" />
                        {{ article.category.name }}
                      </span>
                      <span>{{ formatDate(article.published_at || article.created_at) }}</span>
                      <span class="flex items-center gap-1">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        {{ formatNumber(article.views_count) }}
                      </span>
                    </div>

                    <!-- Bookmark button -->
                    <button
                      @click.stop="handleBookmark(article.id)"
                      :disabled="bookmarkLoading === article.id"
                      :class="[
                        'p-1.5 rounded-lg transition-colors flex-shrink-0',
                        isBookmarked(article.id)
                          ? 'text-gray-900 dark:text-gray-100 hover:text-gray-500 dark:hover:text-gray-400'
                          : 'text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300'
                      ]"
                      :aria-label="isBookmarked(article.id) ? 'ยกเลิกบันทึก' : 'บันทึกบทความ'"
                    >
                      <svg
                        class="w-4 h-4"
                        :fill="isBookmarked(article.id) ? 'currentColor' : 'none'"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                      </svg>
                    </button>
                  </div>

                  <!-- Tags -->
                  <div v-if="article.tags && article.tags.length > 0" class="flex flex-wrap gap-1.5 mt-0.5">
                    <span
                      v-for="tag in article.tags.slice(0, 3)"
                      :key="tag.id"
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                      :style="{
                        backgroundColor: tag.color ? tag.color + '15' : undefined,
                        color: tag.color || undefined,
                        borderColor: tag.color ? tag.color + '30' : undefined
                      }"
                      :class="!tag.color ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700' : ''"
                    >
                      <Icon v-if="tag.icon" :name="tag.icon" :size="10" />
                      {{ tag.name }}
                    </span>
                    <span v-if="article.tags.length > 3" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800">
                      +{{ article.tags.length - 3 }}
                    </span>
                  </div>
                </div>

                <!-- Cover image -->
                <div class="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-28 rounded-xl overflow-hidden">
                  <img
                    v-if="article.cover_image_url"
                    :src="article.cover_image_url"
                    :alt="article.title"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center"
                    :style="{
                      background: article.category?.color
                        ? `linear-gradient(135deg, ${article.category.color}20, ${article.category.color}40)`
                        : undefined
                    }"
                    :class="!article.category?.color ? 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700' : ''"
                  >
                    <Icon
                      v-if="article.category?.icon"
                      :name="article.category.icon"
                      :size="24"
                      :style="{ color: article.category?.color || undefined, opacity: '0.6' }"
                      :class="!article.category?.color ? 'text-gray-400 dark:text-gray-500' : ''"
                    />
                    <svg v-else class="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <!-- Load more -->
          <div v-if="hasMore && !isLoading && articles.length > 0" class="text-center py-8">
            <button @click="loadMore" class="px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              โหลดเพิ่มเติม
            </button>
          </div>

          <div v-if="!hasMore && !isLoading && articles.length > 0" class="text-center py-8">
            <p class="text-xs text-gray-400 dark:text-gray-600">อ่านครบทุกบทความแล้ว</p>
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="hidden lg:block w-72 flex-shrink-0 space-y-8">

          <!-- Popular articles -->
          <div>
            <h3 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">บทความยอดนิยม</h3>
            <div class="space-y-1">
              <div v-if="recommendedArticles.length === 0" class="space-y-3">
                <div v-for="n in 3" :key="n" class="flex gap-3 p-2">
                  <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex-shrink-0" />
                  <div class="flex-1 space-y-2 pt-0.5">
                    <div class="h-3.5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div class="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
              </div>

              <div
                v-for="rec in recommendedArticles"
                :key="rec.id"
                @click="goToArticle(rec.slug || rec.id)"
                class="flex gap-3 p-2 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-gray-900 transition-colors group"
              >
                <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    v-if="rec.cover_image_url"
                    :src="rec.cover_image_url"
                    :alt="rec.title"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center"
                  >
                    <svg class="w-5 h-5 text-gray-300 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors">
                    {{ rec.title }}
                  </p>
                  <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {{ formatDate(rec.published_at || rec.created_at) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Email subscription card -->
          <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">รับแจ้งเตือนบทความใหม่</h3>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              กรอกอีเมลเพื่อรับแจ้งเตือนทุกครั้งที่มีบทความใหม่ ไม่ต้องสมัครสมาชิก
            </p>

            <!-- Sent state: waiting for the user to click the confirmation link -->
            <div v-if="subscribeSent" class="flex items-start gap-2 py-2 px-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
              <svg class="w-4 h-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="text-xs text-green-700 dark:text-green-400 leading-relaxed">
                ส่งลิงก์ยืนยันไปที่อีเมลแล้ว กดลิงก์ในอีเมลเพื่อเริ่มติดตาม
              </span>
            </div>

            <form v-else @submit.prevent="handleSidebarSubscribe" class="space-y-2">
              <input
                v-model="subscribeEmailInput"
                type="email"
                required
                autocomplete="email"
                placeholder="you@example.com"
                class="w-full py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
              />
              <button
                type="submit"
                :disabled="subscribeLoading"
                class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg v-if="subscribeLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                ติดตามบทความใหม่
              </button>
              <p v-if="subscribeError" class="text-xs text-red-500 dark:text-red-400">{{ subscribeError }}</p>
            </form>
          </div>

          <!-- Topics -->
          <div>
            <h3 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">หมวดหมู่</h3>
            <div class="flex flex-wrap gap-2">
              <div v-if="categories.length === 0" class="flex flex-wrap gap-2">
                <div v-for="n in 5" :key="n" class="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              </div>
              <button
                v-for="category in categories"
                :key="category.id"
                @click="setActiveTab(category.slug)"
                :class="[
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                  activeTab === category.slug
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                ]"
              >
                <Icon v-if="category.icon" :name="category.icon" :size="12" />
                {{ category.name }}
              </button>
            </div>
          </div>

          <!-- Google Ads (sticky so it stays in view while scrolling the article list) -->
          <div class="sticky top-20">
            <AdSlot :ad-slot="adSlotHomeSidebar" slot-env-name="VITE_ADSENSE_SLOT_HOME_SIDEBAR" :min-height="600" />
          </div>

        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Header from '../components/Header.vue'
import Icon from '../components/Icon.vue'
import AdSlot from '../components/AdSlot.vue'
import { useArticles } from '@/composables/useArticles'
import { useCategories } from '@/composables/useCategories'
import { useFavorites } from '@/composables/useFavorites'
import { useAuth } from '@/composables/useAuth'
import { subscribeEmail } from '@/api/blogApi'

const adSlotHomeSidebar = import.meta.env.VITE_ADSENSE_SLOT_HOME_SIDEBAR as string | undefined

const router = useRouter()
const route = useRoute()

const { articles, loading: isLoading, error, fetchArticles, fetchArticlesByCategory, fetchArticlesByTag } = useArticles()
const { categories, fetchCategories } = useCategories()
const { favorites, fetchFavorites, toggleFavorite } = useFavorites()
const { isAuthenticated } = useAuth()

// New-article email subscription goes through the lab-services API (no login).
const subscribeEmailInput = ref('')
const subscribeLoading = ref(false)
const subscribeSent = ref(false)
const subscribeError = ref<string | null>(null)

const handleSidebarSubscribe = async () => {
  subscribeLoading.value = true
  subscribeError.value = null
  try {
    await subscribeEmail(subscribeEmailInput.value)
    subscribeSent.value = true
  } catch {
    subscribeError.value = 'สมัครไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
  } finally {
    subscribeLoading.value = false
  }
}

const recommendedArticles = ref<any[]>([])
// Filters live in the URL (?category=slug / ?tag=slug) so article pages can link to them
const queryString = (value: unknown) => (typeof value === 'string' && value ? value : null)
const activeTab = ref(queryString(route.query.category) ?? 'all')
const activeTag = ref<string | null>(queryString(route.query.tag))
const currentPage = ref(0)
const hasMore = ref(true)
const articlesPerPage = 10
const bookmarkLoading = ref<string | null>(null)

const isBookmarked = (articleId: string) => {
  return favorites.value.some((f: any) => f.article_id === articleId)
}

const handleBookmark = async (articleId: string) => {
  if (!isAuthenticated.value) {
    alert('กรุณาเข้าสู่ระบบก่อนบันทึกบทความ')
    return
  }
  bookmarkLoading.value = articleId
  await toggleFavorite(articleId)
  bookmarkLoading.value = null
}

const loadArticles = async () => {
  const offset = currentPage.value * articlesPerPage
  let result
  if (activeTag.value) {
    result = await fetchArticlesByTag(activeTag.value, articlesPerPage, offset)
  } else if (activeTab.value === 'all') {
    result = await fetchArticles({ limit: articlesPerPage, offset })
  } else {
    result = await fetchArticlesByCategory(activeTab.value, articlesPerPage, offset)
  }
  hasMore.value = result.hasMore
}

const fetchRecommendedArticles = async () => {
  const result = await fetchArticles({ limit: 3, offset: 0 })
  recommendedArticles.value = result.data || []
}

const setActiveTab = (tab: string) => {
  router.replace({ query: tab === 'all' ? {} : { category: tab } })
}

const clearTag = () => router.replace({ query: {} })

watch(() => route.query, (query) => {
  if (route.path !== '/') return
  activeTab.value = queryString(query.category) ?? 'all'
  activeTag.value = queryString(query.tag)
  currentPage.value = 0
  loadArticles()
})

const loadMore = async () => {
  currentPage.value++
  await loadArticles()
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
    if (diffDays < 1) return 'วันนี้'
    if (diffDays === 1) return 'เมื่อวาน'
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} สัปดาห์ที่แล้ว`
    if (diffDays < 365) return date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

const formatNumber = (num: number) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const goToArticle = (identifier: string | number) => {
  router.push(`/article/${identifier}`)
}

onMounted(async () => {
  await Promise.all([fetchCategories(), loadArticles(), fetchRecommendedArticles()])
  if (isAuthenticated.value) await fetchFavorites()
})

watch(isAuthenticated, async (val) => {
  if (val) await fetchFavorites()
})
</script>
