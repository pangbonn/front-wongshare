import { ref, computed } from 'vue'
import { supabase, type Tag } from '../../supabase/config'

const tags = ref<Tag[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export function useTags() {
  // Fetch all enabled tags
  const fetchTags = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('tags')
        .select('*')
        .eq('enabled', true)
        .order('usage_count', { ascending: false })
        .order('name', { ascending: true })

      if (fetchError) throw fetchError
      tags.value = data || []
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดแท็ก'
      console.error('Error fetching tags:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch all tags (including disabled) - for admin
  const fetchAllTags = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('tags')
        .select('*')
        .order('usage_count', { ascending: false })
        .order('name', { ascending: true })

      if (fetchError) throw fetchError
      tags.value = data || []
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดแท็ก'
      console.error('Error fetching all tags:', err)
    } finally {
      loading.value = false
    }
  }

  // Get tags for specific article
  const getArticleTags = async (articleId: string): Promise<Tag[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('article_tags')
        .select(`
          tag_id,
          tags:tag_id (
            id,
            name,
            slug,
            color,
            icon
          )
        `)
        .eq('article_id', articleId)

      if (fetchError) throw fetchError
      
      // Transform data
      return (data || [])
        .map((item: any) => item.tags)
        .filter((tag: Tag) => tag && tag.enabled !== false)
    } catch (err: any) {
      console.error('Error fetching article tags:', err)
      return []
    }
  }

  // Get tag by slug
  const getTagBySlug = async (slug: string): Promise<Tag | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('tags')
        .select('*')
        .eq('slug', slug)
        .eq('enabled', true)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
      return data
    } catch (err: any) {
      console.error('Error fetching tag by slug:', err)
      return null
    }
  }

  // Get tag by ID
  const getTagById = async (id: string): Promise<Tag | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('tags')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
      return data
    } catch (err: any) {
      console.error('Error fetching tag by id:', err)
      return null
    }
  }

  // Add tags to article
  const addTagsToArticle = async (articleId: string, tagIds: string[]) => {
    try {
      loading.value = true
      error.value = null

      // Remove existing tags first (optional - depends on your use case)
      // await removeAllTagsFromArticle(articleId)

      // Insert new tags
      const articleTags = tagIds.map(tagId => ({
        article_id: articleId,
        tag_id: tagId
      }))

      const { data, error: insertError } = await supabase
        .from('article_tags')
        .insert(articleTags)
        .select()

      if (insertError) throw insertError
      return { success: true, data, error: null }
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการเพิ่มแท็ก'
      console.error('Error adding tags to article:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Remove tag from article
  const removeTagFromArticle = async (articleId: string, tagId: string) => {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('article_tags')
        .delete()
        .eq('article_id', articleId)
        .eq('tag_id', tagId)

      if (deleteError) throw deleteError
      return { success: true, error: null }
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการลบแท็ก'
      console.error('Error removing tag from article:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Remove all tags from article
  const removeAllTagsFromArticle = async (articleId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('article_tags')
        .delete()
        .eq('article_id', articleId)

      if (deleteError) throw deleteError
      return { success: true, error: null }
    } catch (err: any) {
      console.error('Error removing all tags from article:', err)
      return { success: false, error: err.message }
    }
  }

  // Replace all tags for article (remove old, add new)
  const replaceArticleTags = async (articleId: string, tagIds: string[]) => {
    try {
      // Remove all existing tags
      await removeAllTagsFromArticle(articleId)
      
      // Add new tags
      if (tagIds.length > 0) {
        return await addTagsToArticle(articleId, tagIds)
      }
      
      return { success: true, error: null }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  // Create tag (admin only)
  const createTag = async (tag: Omit<Tag, 'id' | 'usage_count' | 'created_at' | 'updated_at'>) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: insertError } = await supabase
        .from('tags')
        .insert(tag)
        .select()
        .single()

      if (insertError) throw insertError

      // Refresh tags list
      await fetchTags()
      return { success: true, data, error: null }
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการสร้างแท็ก'
      console.error('Error creating tag:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Update tag (admin only)
  const updateTag = async (id: string, updates: Partial<Tag>) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('tags')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      // Refresh tags list
      await fetchTags()
      return { success: true, data, error: null }
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการอัปเดตแท็ก'
      console.error('Error updating tag:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Delete tag (admin only)
  const deleteTag = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('tags')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Refresh tags list
      await fetchTags()
      return { success: true, error: null }
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการลบแท็ก'
      console.error('Error deleting tag:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Toggle tag enabled status
  const toggleTag = async (id: string, enabled: boolean) => {
    return await updateTag(id, { enabled })
  }

  // Search tags by name
  const searchTags = async (query: string): Promise<Tag[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('tags')
        .select('*')
        .eq('enabled', true)
        .ilike('name', `%${query}%`)
        .order('usage_count', { ascending: false })
        .limit(20)

      if (fetchError) throw fetchError
      return data || []
    } catch (err: any) {
      console.error('Error searching tags:', err)
      return []
    }
  }

  return {
    tags: computed(() => tags.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchTags,
    fetchAllTags,
    getArticleTags,
    getTagBySlug,
    getTagById,
    addTagsToArticle,
    removeTagFromArticle,
    removeAllTagsFromArticle,
    replaceArticleTags,
    createTag,
    updateTag,
    deleteTag,
    toggleTag,
    searchTags
  }
}

