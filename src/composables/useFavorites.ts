import { ref, computed } from 'vue'
import { supabase, type UserFavoriteView } from '../../supabase/config'
import { useAuth } from './useAuth'

const favorites = ref<UserFavoriteView[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export function useFavorites() {
  const { user, isAuthenticated } = useAuth()

  // Fetch user favorites
  const fetchFavorites = async () => {
    if (!isAuthenticated.value || !user.value) {
      error.value = 'กรุณาเข้าสู่ระบบก่อน'
      return
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('user_favorites_view')
        .select('*')
        .eq('user_id', user.value.id)
        .order('favorited_at', { ascending: false })

      if (fetchError) throw fetchError
      favorites.value = data || []
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดรายการโปรด'
      console.error('Error fetching favorites:', err)
    } finally {
      loading.value = false
    }
  }

  // Add to favorites
  const addFavorite = async (articleId: string) => {
    if (!isAuthenticated.value || !user.value) {
      error.value = 'กรุณาเข้าสู่ระบบก่อน'
      return { success: false, error: 'กรุณาเข้าสู่ระบบก่อน' }
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: insertError } = await supabase
        .from('favorites')
        .insert({
          user_id: user.value.id,
          article_id: articleId
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Refresh favorites list
      await fetchFavorites()
      return { success: true, data, error: null }
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการเพิ่มรายการโปรด'
      console.error('Error adding favorite:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Remove from favorites
  const removeFavorite = async (articleId: string) => {
    if (!isAuthenticated.value || !user.value) {
      error.value = 'กรุณาเข้าสู่ระบบก่อน'
      return { success: false, error: 'กรุณาเข้าสู่ระบบก่อน' }
    }

    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.value.id)
        .eq('article_id', articleId)

      if (deleteError) throw deleteError

      // Refresh favorites list
      await fetchFavorites()
      return { success: true, error: null }
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการลบรายการโปรด'
      console.error('Error removing favorite:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Check if article is favorited
  const isFavorited = async (articleId: string): Promise<boolean> => {
    if (!isAuthenticated.value || !user.value) return false

    try {
      const { data, error: checkError } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.value.id)
        .eq('article_id', articleId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') throw checkError
      return !!data
    } catch (err) {
      console.error('Error checking favorite:', err)
      return false
    }
  }

  // Toggle favorite
  const toggleFavorite = async (articleId: string) => {
    const favorited = await isFavorited(articleId)
    if (favorited) {
      return await removeFavorite(articleId)
    } else {
      return await addFavorite(articleId)
    }
  }

  return {
    favorites: computed(() => favorites.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchFavorites,
    addFavorite,
    removeFavorite,
    isFavorited,
    toggleFavorite
  }
}

