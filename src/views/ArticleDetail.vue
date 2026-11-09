<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
    <Header :show-back-button="true" />

    <!-- Reading progress -->
    <div v-if="article && !isLoading" class="fixed top-14 inset-x-0 z-40 h-0.5 pointer-events-none" aria-hidden="true">
      <div class="h-full bg-blue-500 origin-left" :style="{ transform: `scaleX(${readProgress})` }" />
    </div>

    <!-- Skeleton -->
    <ArticleDetailSkeleton v-if="isLoading" />

    <!-- Error -->
    <div v-else-if="error" class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div class="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-5 flex gap-3">
        <svg class="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div>
          <p class="text-sm font-medium text-red-800 dark:text-red-300">โหลดบทความไม่สำเร็จ</p>
          <p class="text-sm text-red-600 dark:text-red-400 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Article -->
    <div v-else-if="article" class="relative max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

      <!-- Table of contents (desktop: sticky sidebar) -->
      <aside v-if="headings.length >= 2" class="hidden xl:block absolute top-10 bottom-0 left-full w-56 ml-4">
        <div class="sticky top-24">
          <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">สารบัญ</p>
          <ArticleToc :headings="headings" :active-id="activeHeadingId" @navigate="goToHeading" />
        </div>
      </aside>

      <!-- Category + Tags -->
      <div v-if="article.category || (article.tags && article.tags.length)" class="flex flex-wrap gap-2 mb-5">
        <router-link
          v-if="article.category"
          :to="{ path: '/', query: { category: article.categorySlug } }"
          class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold hover:opacity-80 transition-opacity"
          :style="{
            backgroundColor: article.categoryColor ? article.categoryColor + '18' : undefined,
            color: article.categoryColor || undefined
          }"
          :class="!article.categoryColor ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300' : ''"
        >{{ article.category }}</router-link>
        <router-link
          v-for="tag in article.tags"
          :key="tag.slug"
          :to="{ path: '/', query: { tag: tag.slug } }"
          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >#{{ tag.name }}</router-link>
      </div>

      <!-- Title -->
      <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-4">
        {{ article.title }}
      </h1>

      <!-- Excerpt -->
      <p v-if="article.summary" class="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
        {{ article.summary }}
      </p>

      <!-- Author row -->
      <div class="flex items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div class="flex items-center gap-3">
          <img
            v-if="article.authorAvatar"
            :src="article.authorAvatar"
            :alt="article.author"
            class="w-10 h-10 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700"
          />
          <div
            v-else
            class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-semibold text-gray-500 dark:text-gray-400"
          >
            {{ article.author?.charAt(0)?.toUpperCase() || '?' }}
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ article.author }}</p>
            <div class="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
              <span>{{ article.date }}</span>
              <span>·</span>
              <span>อ่าน {{ article.readingTime }} นาที</span>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="flex items-center gap-1">
          <!-- Like -->
          <button
            @click="toggleLike"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              liked
                ? 'bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            ]"
          >
            <svg
              class="w-3.5 h-3.5 transition-transform"
              :class="{ 'scale-110': liked }"
              :fill="liked ? 'currentColor' : 'none'"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            {{ article.likesCount + (liked ? 1 : 0) }}
          </button>

          <!-- Bookmark -->
          <button
            @click="handleBookmark"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              bookmarked
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            ]"
          >
            <svg class="w-3.5 h-3.5" :fill="bookmarked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
            {{ bookmarked ? 'บันทึกแล้ว' : 'บันทึก' }}
          </button>

          <!-- Share -->
          <button
            @click="shareArticle"
            class="p-2 rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Cover image -->
      <div v-if="article.image" class="mb-8 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
        <div v-if="imageLoading" class="w-full h-64 sm:h-80 flex items-center justify-center">
          <div class="flex gap-1.5">
            <div class="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" style="animation-delay: 0ms" />
            <div class="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" style="animation-delay: 150ms" />
            <div class="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" style="animation-delay: 300ms" />
          </div>
        </div>
        <img
          v-show="!imageLoading && !imageError"
          :src="article.image"
          :alt="article.title"
          class="w-full max-h-96 object-cover"
          @load="imageLoading = false; imageError = false"
          @error="imageLoading = false; imageError = true"
        />
        <div v-if="imageError && !imageLoading" class="w-full h-32 flex items-center justify-center">
          <svg class="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
      </div>

      <!-- Article content — images, code, diagrams, callouts -->
      <!-- Table of contents (mobile / tablet: collapsible) -->
      <details
        v-if="headings.length >= 2"
        ref="mobileToc"
        class="xl:hidden mb-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
      >
        <summary class="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          สารบัญ ({{ headings.length }} หัวข้อ)
        </summary>
        <div class="px-2 pb-3">
          <ArticleToc :headings="headings" :active-id="activeHeadingId" @navigate="goToHeading" />
        </div>
      </details>

      <div ref="contentEl">
        <ArticleContent v-if="article.content" :html="article.content" @headings="onHeadings" />
      </div>

      <!-- Footer stats -->
      <div class="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div class="flex items-center gap-4 text-sm text-gray-400 dark:text-gray-500">
          <span class="flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            {{ formatNumber(article.viewsCount) }} ครั้ง
          </span>
          <span class="flex items-center gap-1.5">
            <svg class="w-4 h-4" :fill="liked ? '#ef4444' : 'none'" :stroke="liked ? 'none' : 'currentColor'" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            {{ formatNumber(article.likesCount + (liked ? 1 : 0)) }}
          </span>
        </div>
        <button
          @click="shareArticle"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
          </svg>
          แชร์บทความ
        </button>
      </div>

      <!-- Related articles -->
      <div v-if="relatedArticles.length > 0 || relatedLoading" class="mt-12">
        <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5">บทความที่เกี่ยวข้อง</h2>

        <div v-if="relatedLoading" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="i in 4" :key="i" class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
            <div class="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3" />
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div class="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <article
            v-for="rel in relatedArticles"
            :key="rel.id"
            @click="goToArticle(rel.id)"
            class="group rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm dark:hover:shadow-gray-900 overflow-hidden cursor-pointer transition-all bg-white dark:bg-gray-900"
          >
            <div class="w-full h-36 bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <img
                v-if="rel.image"
                :src="rel.image"
                :alt="rel.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                @error="(e) => { (e.target as HTMLImageElement).style.display = 'none' }"
              />
              <div v-else class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800" />
            </div>
            <div class="p-4">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors mb-1">
                {{ rel.title }}
              </h3>
              <p class="text-xs text-gray-400 dark:text-gray-500">{{ rel.author }} · {{ rel.date }}</p>
            </div>
          </article>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Header from '../components/Header.vue'
import ArticleDetailSkeleton from '../components/ArticleDetailSkeleton.vue'
import ArticleContent, { type ArticleHeading } from '../components/ArticleContent.vue'
import ArticleToc from '../components/ArticleToc.vue'
import { useArticles } from '@/composables/useArticles'
import { useFavorites } from '@/composables/useFavorites'
import { useAuth } from '@/composables/useAuth'
import { sampleArticle, SAMPLE_ARTICLE_ID } from '@/data/sampleArticle'
import { setPageMeta, resetPageMeta } from '@/utils/pageMeta'
import { HEADER_OFFSET, scrollToAnchor, pinToAnchor } from '@/utils/scroll'

const router = useRouter()
const route = useRoute()
const articleId = computed(() => route.params.id as string)

interface Article {
  id: string
  author: string
  authorAvatar: string | null
  title: string
  summary: string
  content: string
  date: string
  likesCount: number
  viewsCount: number
  readingTime: number
  image: string | null
  category: string
  categorySlug: string
  categoryColor: string | null
  tags: { name: string; slug: string }[]
}

interface RelatedArticle {
  id: string
  author: string
  title: string
  date: string
  image: string | null
}

const article = ref<Article | null>(null)
const imageLoading = ref(true)
const imageError = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)
const liked = ref(false)
const bookmarked = ref(false)
const relatedArticles = ref<RelatedArticle[]>([])
const relatedLoading = ref(false)

const { article: supabaseArticle, loading, error: articleError, fetchArticle: fetchFromSupabase, fetchRelatedArticles: fetchRelatedFromSupabase } = useArticles()
const { isFavorited, toggleFavorite } = useFavorites()
const { isAuthenticated } = useAuth()

const calculateReadingTime = (content: string): number => {
  const plain = content.replace(/<[^>]+>/g, '')
  return Math.max(1, Math.ceil(plain.length / 400))
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
    if (diffDays < 1) return 'วันนี้'
    if (diffDays === 1) return 'เมื่อวาน'
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} สัปดาห์ที่แล้ว`
    return date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

const formatNumber = (num: number): string => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

watch(supabaseArticle, async (newArticle) => {
  if (!newArticle) return
  const content = newArticle.content || ''
  article.value = {
    id: newArticle.id,
    author: newArticle.author?.name || 'Unknown',
    authorAvatar: newArticle.author?.avatar_url || null,
    title: newArticle.title,
    summary: newArticle.excerpt || content.replace(/<[^>]+>/g, '').substring(0, 200),
    content,
    date: formatDate(newArticle.published_at || newArticle.created_at),
    likesCount: newArticle.likes_count ?? 0,
    viewsCount: newArticle.views_count ?? 0,
    readingTime: calculateReadingTime(content),
    image: newArticle.cover_image_url || null,
    category: newArticle.category?.name || '',
    categorySlug: newArticle.category?.slug || '',
    categoryColor: newArticle.category?.color || null,
    tags: newArticle.tags?.map((t: any) => ({ name: t.name, slug: t.slug })) || []
  }
  imageLoading.value = !!article.value.image
  imageError.value = false
  if (isAuthenticated.value) {
    bookmarked.value = await isFavorited(newArticle.id)
  }
  if (newArticle.id) loadRelatedArticles(newArticle.id)
}, { immediate: true })

watch(loading, (v) => { isLoading.value = v })
watch(articleError, (v) => { error.value = v })

const loadRelatedArticles = async (id: string) => {
  try {
    relatedLoading.value = true
    const related = await fetchRelatedFromSupabase(id)
    relatedArticles.value = related.map((rel: any) => ({
      id: rel.id,
      author: rel.author?.name || 'Unknown',
      title: rel.title,
      date: formatDate(rel.published_at || rel.created_at),
      image: rel.cover_image_url || null
    }))
  } catch (err) {
    console.error('Error loading related articles:', err)
  } finally {
    relatedLoading.value = false
  }
}

const toggleLike = () => { liked.value = !liked.value }

const handleBookmark = async () => {
  if (!isAuthenticated.value) {
    alert('กรุณาเข้าสู่ระบบก่อนบันทึกบทความ')
    return
  }
  if (!supabaseArticle.value?.id) return
  const result = await toggleFavorite(supabaseArticle.value.id)
  if (result?.success !== false) bookmarked.value = !bookmarked.value
}

const shareArticle = async () => {
  if (!article.value) return
  const shareData = { title: article.value.title, text: article.value.summary, url: window.location.href }
  try {
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('คัดลอกลิงก์แล้ว!')
    }
  } catch {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('คัดลอกลิงก์แล้ว!')
    } catch {
      alert('ไม่สามารถแชร์ได้ในขณะนี้')
    }
  }
}

const goToArticle = (id: string) => router.push(`/article/${id}`)

// ---- Table of contents + reading progress ----
const contentEl = ref<HTMLElement | null>(null)
const mobileToc = ref<HTMLDetailsElement | null>(null)
const headings = ref<ArticleHeading[]>([])
const activeHeadingId = ref<string | null>(null)
const readProgress = ref(0)

const updateScrollState = () => {
  const el = contentEl.value
  if (el) {
    const start = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
    const distance = el.offsetHeight - window.innerHeight + HEADER_OFFSET
    readProgress.value = Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(distance, 1)))
  }

  let current: string | null = null
  for (const h of headings.value) {
    const node = document.getElementById(h.id)
    if (node && node.getBoundingClientRect().top <= HEADER_OFFSET + 10) current = h.id
    else break
  }
  activeHeadingId.value = current ?? headings.value[0]?.id ?? null
}

let scrollFrame = 0
const onScroll = () => {
  cancelAnimationFrame(scrollFrame)
  scrollFrame = requestAnimationFrame(updateScrollState)
}

let stopPinning = () => {}

const onHeadings = async (list: ArticleHeading[]) => {
  headings.value = list
  await nextTick()
  // Deep link (/article/x#heading): content renders after navigation, so scroll here
  stopPinning()
  if (route.hash) stopPinning = pinToAnchor(route.hash.slice(1))
  updateScrollState()
}

const goToHeading = (id: string) => {
  if (mobileToc.value) mobileToc.value.open = false
  // Same hash → router treats it as a duplicate navigation and won't scroll
  if (route.hash.slice(1) === id) scrollToAnchor(id)
  else router.replace({ hash: `#${id}` })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  cancelAnimationFrame(scrollFrame)
  stopPinning()
  resetPageMeta()
})

watch(article, (a) => {
  if (a) setPageMeta({ title: a.title, description: a.summary, image: a.image, type: 'article' })
})

watch(articleId, (id) => {
  headings.value = []
  readProgress.value = 0
  if (id === SAMPLE_ARTICLE_ID) {
    article.value = { ...sampleArticle }
    imageLoading.value = true
    imageError.value = false
    relatedArticles.value = []
    return
  }
  if (id) fetchFromSupabase(id)
}, { immediate: true })
</script>
