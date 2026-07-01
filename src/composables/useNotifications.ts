import { ref, computed } from 'vue'
import { supabase, type Notification } from '../../supabase/config'
import { useAuth } from './useAuth'

const notifications = ref<Notification[]>([])
const unreadCount = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)

export function useNotifications() {
  const { user, isAuthenticated } = useAuth()

  // Fetch user notifications
  const fetchNotifications = async (limit = 50) => {
    if (!isAuthenticated.value || !user.value) {
      error.value = 'กรุณาเข้าสู่ระบบก่อน'
      return
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.value.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (fetchError) throw fetchError
      notifications.value = data || []
      updateUnreadCount()
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดการแจ้งเตือน'
      console.error('Error fetching notifications:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!isAuthenticated.value || !user.value) {
      unreadCount.value = 0
      return
    }

    try {
      const { count, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.value.id)
        .eq('read', false)

      if (countError) throw countError
      unreadCount.value = count || 0
    } catch (err: any) {
      console.error('Error fetching unread count:', err)
    }
  }

  // Update unread count from current notifications
  const updateUnreadCount = () => {
    unreadCount.value = notifications.value.filter(n => !n.read).length
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!isAuthenticated.value || !user.value) {
      error.value = 'กรุณาเข้าสู่ระบบก่อน'
      return { success: false, error: 'กรุณาเข้าสู่ระบบก่อน' }
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('notifications')
        .update({ 
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', user.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state
      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        notifications.value[index] = data
        updateUnreadCount()
      }

      return { success: true, data, error: null }
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการอัปเดตการแจ้งเตือน'
      console.error('Error marking notification as read:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    if (!isAuthenticated.value || !user.value) {
      error.value = 'กรุณาเข้าสู่ระบบก่อน'
      return { success: false, error: 'กรุณาเข้าสู่ระบบก่อน' }
    }

    try {
      loading.value = true
      error.value = null

      const { error: updateError } = await supabase
        .from('notifications')
        .update({ 
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', user.value.id)
        .eq('read', false)

      if (updateError) throw updateError

      // Update local state
      notifications.value.forEach(n => {
        if (!n.read) {
          n.read = true
          n.read_at = new Date().toISOString()
        }
      })
      updateUnreadCount()

      return { success: true, error: null }
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการอัปเดตการแจ้งเตือนทั้งหมด'
      console.error('Error marking all as read:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    if (!isAuthenticated.value || !user.value) {
      error.value = 'กรุณาเข้าสู่ระบบก่อน'
      return { success: false, error: 'กรุณาเข้าสู่ระบบก่อน' }
    }

    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.value.id)

      if (deleteError) throw deleteError

      // Update local state
      notifications.value = notifications.value.filter(n => n.id !== notificationId)
      updateUnreadCount()

      return { success: true, error: null }
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการลบการแจ้งเตือน'
      console.error('Error deleting notification:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Create notification (for system use)
  const createNotification = async (
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    link?: string
  ) => {
    try {
      const { data, error: insertError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          link: link || null
        })
        .select()
        .single()

      if (insertError) throw insertError
      return { success: true, data, error: null }
    } catch (err: any) {
      console.error('Error creating notification:', err)
      return { success: false, error: err.message }
    }
  }

  // Subscribe to real-time notifications
  const subscribeToNotifications = () => {
    if (!isAuthenticated.value || !user.value) return

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.value!.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification
          notifications.value.unshift(newNotification)
          if (!newNotification.read) {
            unreadCount.value++
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  return {
    notifications: computed(() => notifications.value),
    unreadCount: computed(() => unreadCount.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    subscribeToNotifications
  }
}

