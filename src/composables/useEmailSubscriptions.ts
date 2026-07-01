import { ref, computed } from 'vue'
import { supabase } from '../../supabase/config'
import { useAuth } from './useAuth'

export interface EmailSubscription {
  id: string
  user_id: string
  email: string
  subscription_updates: boolean
  new_articles: boolean
  weekly_digest: boolean
  marketing_emails: boolean
  enabled: boolean
  created_at: string
  updated_at: string
}

const emailSubscription = ref<EmailSubscription | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export function useEmailSubscriptions() {
  const { user, isAuthenticated } = useAuth()

  // Fetch email subscription settings
  const fetchEmailSubscription = async () => {
    if (!isAuthenticated.value || !user.value) {
      error.value = 'กรุณาเข้าสู่ระบบก่อน'
      return
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('email_subscriptions')
        .select('*')
        .eq('user_id', user.value.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
      
      // If no subscription exists, create one
      if (!data) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.value.id)
          .single()

        const { data: newSubscription, error: createError } = await supabase
          .from('email_subscriptions')
          .insert({
            user_id: user.value.id,
            email: profileData?.email || user.value.email || '',
            subscription_updates: true,
            new_articles: true,
            weekly_digest: false,
            marketing_emails: false,
            enabled: true
          })
          .select()
          .single()

        if (createError) throw createError
        emailSubscription.value = newSubscription
      } else {
        emailSubscription.value = data
      }
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดการตั้งค่าอีเมล'
      console.error('Error fetching email subscription:', err)
    } finally {
      loading.value = false
    }
  }

  // Update email subscription settings
  const updateEmailSubscription = async (updates: Partial<EmailSubscription>) => {
    if (!isAuthenticated.value || !user.value) {
      error.value = 'กรุณาเข้าสู่ระบบก่อน'
      return { success: false, error: 'กรุณาเข้าสู่ระบบก่อน' }
    }

    try {
      loading.value = true
      error.value = null

      // If subscription doesn't exist, create it first
      if (!emailSubscription.value) {
        await fetchEmailSubscription()
      }

      const { data, error: updateError } = await supabase
        .from('email_subscriptions')
        .update(updates)
        .eq('user_id', user.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      emailSubscription.value = data
      return { success: true, data, error: null }
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการอัปเดตการตั้งค่าอีเมล'
      console.error('Error updating email subscription:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Toggle specific email type
  const toggleEmailType = async (
    type: 'subscription_updates' | 'new_articles' | 'weekly_digest' | 'marketing_emails' | 'enabled',
    value?: boolean
  ) => {
    const currentValue = emailSubscription.value?.[type] ?? false
    const newValue = value !== undefined ? value : !currentValue

    return await updateEmailSubscription({ [type]: newValue })
  }

  // Enable/disable all emails
  const toggleAllEmails = async (enabled: boolean) => {
    return await updateEmailSubscription({ enabled })
  }

  return {
    emailSubscription: computed(() => emailSubscription.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchEmailSubscription,
    updateEmailSubscription,
    toggleEmailType,
    toggleAllEmails
  }
}

