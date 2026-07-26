import { ref, computed } from 'vue'
import { supabase, type Category } from '../../supabase/config'
import { fetchCategoryList } from '../api/blogApi'

const categories = ref<Category[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

/** Maps the new API's shape onto the old `Category` type so consuming
 * components (Home.vue) don't need to change at all. */
function toLegacyCategory(c: { name: string; slug: string; icon: string | null; color: string | null }): Category {
  return {
    id: c.slug,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    color: c.color,
    enabled: true,
    sort_order: 0,
  } as Category
}

export function useCategories() {
  // Fetch all enabled categories — now from the lab-services blog API.
  const fetchCategories = async () => {
    try {
      loading.value = true
      error.value = null

      const data = await fetchCategoryList()
      categories.value = data.map(toLegacyCategory)
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดหมวดหมู่'
      console.error('Error fetching categories:', err)
    } finally {
      loading.value = false
    }
  }

  // ---- Everything below still talks to the OLD Supabase project directly.
  // No routed view currently calls these (no admin/editor UI exists yet) —
  // left as-is rather than migrated blind. Wire these to
  // POST/PATCH/DELETE /blog/admin/categories (with a writer JWT) when an
  // admin UI is actually built. ----

  // Fetch all categories (including disabled) - for admin
  const fetchAllCategories = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      if (fetchError) throw fetchError
      categories.value = data || []
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดหมวดหมู่'
      console.error('Error fetching all categories:', err)
    } finally {
      loading.value = false
    }
  }

  // Get category by slug
  const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('enabled', true)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
      return data
    } catch (err: any) {
      console.error('Error fetching category by slug:', err)
      return null
    }
  }

  // Get category by ID
  const getCategoryById = async (id: string): Promise<Category | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
      return data
    } catch (err: any) {
      console.error('Error fetching category by id:', err)
      return null
    }
  }

  // Create category (admin only)
  const createCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: insertError } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single()

      if (insertError) throw insertError

      // Refresh categories list
      await fetchCategories()
      return { success: true, data, error: null }
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการสร้างหมวดหมู่'
      console.error('Error creating category:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Update category (admin only)
  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      // Refresh categories list
      await fetchCategories()
      return { success: true, data, error: null }
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการอัปเดตหมวดหมู่'
      console.error('Error updating category:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Delete category (admin only)
  const deleteCategory = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Refresh categories list
      await fetchCategories()
      return { success: true, error: null }
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการลบหมวดหมู่'
      console.error('Error deleting category:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Toggle category enabled status
  const toggleCategory = async (id: string, enabled: boolean) => {
    return await updateCategory(id, { enabled })
  }

  return {
    categories: computed(() => categories.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchCategories,
    fetchAllCategories,
    getCategoryBySlug,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategory
  }
}
