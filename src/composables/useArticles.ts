import { ref, computed } from 'vue'
import { supabase, type Article, type ArticleWithTags } from '../../supabase/config'
import { useAuth } from './useAuth'
import {
  fetchArticleList,
  fetchArticleBySlug,
  type BlogArticleListItem,
  type BlogArticleDetail,
} from '../api/blogApi'
import { normalizeArticleHtml } from '../utils/normalizeArticleHtml'

const articles = ref<ArticleWithTags[]>([])
const article = ref<ArticleWithTags | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

/** Maps a list item from the new blog API onto the old `ArticleWithTags`
 * shape so ArticleDetail.vue / Home.vue don't need to change. List items
 * don't carry id/content/createdAt/updatedAt (kept light on purpose) — id
 * falls back to slug, which is what routing/keys already use anyway. */
function mapListItem(a: BlogArticleListItem): ArticleWithTags {
  return {
    id: a.slug,
    title: a.title,
    slug: a.slug,
    content: '',
    excerpt: a.excerpt,
    cover_image_url: a.coverThumbUrl,
    author_id: null,
    category_id: a.category?.slug ?? null,
    published: true,
    published_at: a.publishedAt,
    views_count: a.viewCount,
    likes_count: a.likeCount,
    created_at: a.publishedAt ?? new Date().toISOString(),
    updated_at: a.publishedAt ?? new Date().toISOString(),
    tags: a.tags.map((t) => ({
      id: t.slug,
      name: t.name,
      slug: t.slug,
      description: null,
      color: t.color,
      icon: t.icon,
      enabled: true,
      usage_count: 0,
    })) as any,
    category: a.category
      ? ({
          id: a.category.slug,
          name: a.category.name,
          slug: a.category.slug,
          description: null,
          icon: a.category.icon,
          color: a.category.color,
          enabled: true,
          sort_order: 0,
        } as any)
      : null,
    author: a.author
      ? { id: a.author.name, name: a.author.name, avatar_url: a.author.avatarThumbUrl, bio: null, specialization: null }
      : undefined,
  } as unknown as ArticleWithTags
}

/** Same idea as mapListItem, but detail responses have real id/content/timestamps
 * and no `excerpt` (ArticleDetail.vue already falls back to stripping `content`
 * itself when excerpt is falsy, so an empty string here is intentional). */
function mapDetail(a: BlogArticleDetail): ArticleWithTags {
  return {
    ...mapListItem({ ...a, excerpt: '' }),
    id: a.id,
    content: normalizeArticleHtml(a.contentHtml),
    created_at: a.createdAt,
    updated_at: a.updatedAt,
    author: a.author
      ? {
          id: a.author.name,
          name: a.author.name,
          avatar_url: a.author.avatarThumbUrl,
          bio: a.author.bio ?? null,
          specialization: a.author.specialization ?? null,
        }
      : undefined,
  } as unknown as ArticleWithTags
}

export function useArticles() {
  const { isAuthenticated, user } = useAuth()

  // Fetch published articles with pagination — now from the lab-services
  // blog API. `categoryId`/`tagId` here are actually slugs (the new API has
  // no separate numeric ids for these), kept as the same param names so
  // call sites don't need to change.
  const fetchArticles = async (options?: {
    limit?: number
    offset?: number
    categoryId?: string
    tagId?: string
    authorId?: string
  }) => {
    try {
      loading.value = true
      error.value = null

      const limit = options?.limit || 10
      const offset = options?.offset || 0
      const page = Math.floor(offset / limit) + 1

      const data = await fetchArticleList({
        page,
        pageSize: limit,
        category: options?.categoryId,
        tag: options?.tagId,
      })

      const transformedArticles = data.map(mapListItem)

      if (offset === 0) {
        articles.value = transformedArticles
      } else {
        articles.value.push(...transformedArticles)
      }

      return {
        data: transformedArticles,
        hasMore: transformedArticles.length === limit
      }
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดบทความ'
      console.error('Error fetching articles:', err)
      return { data: [], hasMore: false }
    } finally {
      loading.value = false
    }
  }

  // Fetch articles by category — the new API filters by category slug
  // directly, no separate lookup needed.
  const fetchArticlesByCategory = async (categorySlug: string, limit = 10, offset = 0) => {
    return await fetchArticles({ categoryId: categorySlug, limit, offset })
  }

  // Fetch articles by tag — same simplification as category.
  const fetchArticlesByTag = async (tagSlug: string, limit = 10, offset = 0) => {
    return await fetchArticles({ tagId: tagSlug, limit, offset })
  }

  // Fetch single article by slug or id — the new API only looks up by slug,
  // which covers every routed call site (article ids in URLs are already
  // slugs coming out of mapListItem/mapDetail above).
  const fetchArticle = async (identifier: string) => {
    try {
      loading.value = true
      error.value = null

      const data = await fetchArticleBySlug(identifier)
      article.value = mapDetail(data)

      // View count is incremented server-side automatically on this same
      // request — no separate "increment views" call needed anymore.

      return article.value
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดบทความ'
      console.error('Error fetching article:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Fetch related articles — approximated as "other published articles in
  // the same category" (the new API has no dedicated related-articles
  // endpoint / cross-tag scoring like the old Supabase version did).
  const fetchRelatedArticles = async (articleId: string, limit = 4) => {
    try {
      const currentArticle = article.value
      if (!currentArticle?.category?.slug) return []

      const data = await fetchArticleList({ category: currentArticle.category.slug, pageSize: limit + 1 })
      return data
        .filter((a) => a.slug !== articleId)
        .slice(0, limit)
        .map(mapListItem)
    } catch (err: any) {
      console.error('Error fetching related articles:', err)
      return []
    }
  }

  // ---- Everything below still talks to the OLD Supabase project directly.
  // No routed view currently calls these (no admin/editor UI exists yet) —
  // left as-is rather than migrated blind. Wire these to
  // POST/PATCH/DELETE /blog/admin/articles (with a writer JWT) when an
  // admin UI is actually built. ----

  // Create article (author only)
  const createArticle = async (articleData: {
    title: string
    slug?: string
    content: string
    excerpt?: string
    cover_image_url?: string
    category_id?: string
    published?: boolean
    tagIds?: string[]
  }) => {
    if (!isAuthenticated.value || !user.value) {
      return { success: false, error: 'กรุณาเข้าสู่ระบบก่อน' }
    }

    try {
      loading.value = true
      error.value = null

      // Generate slug if not provided
      const slug = articleData.slug || generateSlug(articleData.title)

      // Create article
      const { data: newArticle, error: insertError } = await supabase
        .from('articles')
        .insert({
          title: articleData.title,
          slug,
          content: articleData.content,
          excerpt: articleData.excerpt || null,
          cover_image_url: articleData.cover_image_url || null,
          category_id: articleData.category_id || null,
          author_id: user.value.id,
          published: articleData.published || false,
          published_at: articleData.published ? new Date().toISOString() : null
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Add tags if provided
      if (articleData.tagIds && articleData.tagIds.length > 0) {
        await supabase
          .from('article_tags')
          .insert(
            articleData.tagIds.map(tagId => ({
              article_id: newArticle.id,
              tag_id: tagId
            }))
          )
      }

      return { success: true, data: newArticle, error: null }
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการสร้างบทความ'
      console.error('Error creating article:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Update article (author only)
  const updateArticle = async (articleId: string, updates: Partial<Article> & { tagIds?: string[] }) => {
    if (!isAuthenticated.value || !user.value) {
      return { success: false, error: 'กรุณาเข้าสู่ระบบก่อน' }
    }

    try {
      loading.value = true
      error.value = null

      const { tagIds, ...articleUpdates } = updates

      // Update article
      const { data, error: updateError } = await supabase
        .from('articles')
        .update(articleUpdates)
        .eq('id', articleId)
        .eq('author_id', user.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update tags if provided
      if (tagIds !== undefined) {
        // Remove all existing tags
        await supabase
          .from('article_tags')
          .delete()
          .eq('article_id', articleId)

        // Add new tags
        if (tagIds.length > 0) {
          await supabase
            .from('article_tags')
            .insert(
              tagIds.map(tagId => ({
                article_id: articleId,
                tag_id: tagId
              }))
            )
        }
      }

      return { success: true, data, error: null }
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการอัปเดตบทความ'
      console.error('Error updating article:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Delete article (author only)
  const deleteArticle = async (articleId: string) => {
    if (!isAuthenticated.value || !user.value) {
      return { success: false, error: 'กรุณาเข้าสู่ระบบก่อน' }
    }

    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId)
        .eq('author_id', user.value.id)

      if (deleteError) throw deleteError

      return { success: true, error: null }
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการลบบทความ'
      console.error('Error deleting article:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  return {
    articles: computed(() => articles.value),
    article: computed(() => article.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchArticles,
    fetchArticlesByCategory,
    fetchArticlesByTag,
    fetchArticle,
    fetchRelatedArticles,
    createArticle,
    updateArticle,
    deleteArticle
  }
}
