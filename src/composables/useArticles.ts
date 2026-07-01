import { ref, computed } from 'vue'
import { supabase, type Article, type ArticleWithTags } from '../../supabase/config'
import { useAuth } from './useAuth'

const articles = ref<ArticleWithTags[]>([])
const article = ref<ArticleWithTags | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export function useArticles() {
  const { isAuthenticated, user } = useAuth()

  // Fetch published articles with pagination
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

      let query = supabase
        .from('articles')
        .select(`
          *,
          category:categories(id, name, slug, icon, color),
          author:authors!author_id(id, name, avatar_url, bio, specialization),
          tags:article_tags(
            tag:tags(id, name, slug, color, icon)
          )
        `)
        .eq('published', true)
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // Filter by category
      if (options?.categoryId) {
        query = query.eq('category_id', options.categoryId)
      }

      // Filter by author
      if (options?.authorId) {
        query = query.eq('author_id', options.authorId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Transform data
      const transformedArticles = (data || []).map((item: any) => ({
        ...item,
        tags: item.tags?.map((at: any) => at.tag).filter((t: any) => t) || [],
        category: item.category || null,
        author: item.author || null
      }))

      if (offset === 0) {
        articles.value = transformedArticles as ArticleWithTags[]
      } else {
        articles.value.push(...(transformedArticles as ArticleWithTags[]))
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

  // Fetch articles by category
  const fetchArticlesByCategory = async (categorySlug: string, limit = 10, offset = 0) => {
    try {
      // First get category by slug
      const { data: category, error: catError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .eq('enabled', true)
        .single()

      if (catError || !category) {
        throw new Error('Category not found')
      }

      return await fetchArticles({ categoryId: category.id, limit, offset })
    } catch (err: any) {
      error.value = err.message
      return { data: [], hasMore: false }
    }
  }

  // Fetch articles by tag
  const fetchArticlesByTag = async (tagSlug: string, limit = 10, offset = 0) => {
    try {
      // First get tag by slug
      const { data: tag, error: tagError } = await supabase
        .from('tags')
        .select('id')
        .eq('slug', tagSlug)
        .eq('enabled', true)
        .single()

      if (tagError || !tag) {
        throw new Error('Tag not found')
      }

      // Get articles with this tag
      const { data: articleTags, error: atError } = await supabase
        .from('article_tags')
        .select('article_id')
        .eq('tag_id', tag.id)

      if (atError) throw atError

      const articleIds = articleTags?.map(at => at.article_id) || []

      if (articleIds.length === 0) {
        return { data: [], hasMore: false }
      }

      const { data, error: fetchError } = await supabase
        .from('articles')
        .select(`
          *,
          category:categories(id, name, slug, icon, color),
          author:authors!author_id(id, name, avatar_url, bio, specialization),
          tags:article_tags(
            tag:tags(id, name, slug, color, icon)
          )
        `)
        .eq('published', true)
        .in('id', articleIds)
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (fetchError) throw fetchError

      const transformedArticles = (data || []).map((item: any) => ({
        ...item,
        tags: item.tags?.map((at: any) => at.tag).filter((t: any) => t) || [],
        category: item.category || null,
        author: item.author || null
      }))

      return {
        data: transformedArticles,
        hasMore: transformedArticles.length === limit
      }
    } catch (err: any) {
      error.value = err.message
      return { data: [], hasMore: false }
    }
  }

  // Helper function to check if string is UUID
  const isUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  // Fetch single article by slug or id
  const fetchArticle = async (identifier: string) => {
    try {
      loading.value = true
      error.value = null

      // Build query based on whether identifier is UUID or slug
      let query = supabase
        .from('articles')
        .select(`
          *,
          category:categories(id, name, slug, icon, color),
          author:authors!author_id(
            id, 
            name, 
            avatar_url, 
            bio,
            specialization
          ),
          tags:article_tags(
            tag:tags(id, name, slug, color, icon)
          )
        `)

      // If identifier is UUID, query by id, otherwise query by slug
      if (isUUID(identifier)) {
        query = query.eq('id', identifier)
      } else {
        query = query.eq('slug', identifier)
      }

      const { data, error: fetchError } = await query.single()

      if (fetchError) throw fetchError

      // Transform data
      article.value = {
        ...data,
        tags: data.tags?.map((at: any) => at.tag).filter((t: any) => t) || [],
        category: data.category || null
      }

      // Increment views count (always increment, not just for authenticated users)
      if (data) {
        try {
          await supabase
            .from('articles')
            .update({ views_count: (data.views_count || 0) + 1 })
            .eq('id', data.id)
        } catch (err) {
          console.error('Error incrementing views:', err)
        }
      }

      return article.value
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดบทความ'
      console.error('Error fetching article:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Fetch related articles
  const fetchRelatedArticles = async (articleId: string, limit = 4) => {
    try {
      // Get current article's category and tags
      const currentArticle = article.value
      if (!currentArticle) return []

      const categoryId = currentArticle.category_id
      const tagIds = currentArticle.tags?.map(t => t.id) || []

      // Build query for related articles
      let query = supabase
        .from('articles')
        .select(`
          *,
          category:categories(id, name, slug, icon, color),
          author:authors!author_id(id, name, avatar_url),
          tags:article_tags(
            tag:tags(id, name, slug, color, icon)
          )
        `)
        .eq('published', true)
        .neq('id', articleId)
        .limit(limit)

      // Filter by category or tags
      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Transform and sort by relevance
      const transformed = (data || []).map((item: any) => ({
        ...item,
        tags: item.tags?.map((at: any) => at.tag).filter((t: any) => t) || [],
        category: item.category || null,
        author: item.author || null
      }))

      // Sort by number of matching tags
      transformed.sort((a, b) => {
        const aMatches = a.tags?.filter((t: any) => tagIds.includes(t.id)).length || 0
        const bMatches = b.tags?.filter((t: any) => tagIds.includes(t.id)).length || 0
        return bMatches - aMatches
      })

      return transformed.slice(0, limit)
    } catch (err: any) {
      console.error('Error fetching related articles:', err)
      return []
    }
  }

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

