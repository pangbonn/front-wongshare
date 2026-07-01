import { ref, computed } from 'vue'
import { supabase, type Subscription } from '../../supabase/config'
import { useAuth } from './useAuth'

const subscription = ref<Subscription | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export function useSubscriptions() {
  const { user, isAuthenticated } = useAuth()

  // Fetch user subscription
  const fetchSubscription = async () => {
    if (!isAuthenticated.value || !user.value) {
      error.value = 'กรุณาเข้าสู่ระบบก่อน'
      return
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.value.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
      subscription.value = data
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลการสมัครสมาชิก'
      console.error('Error fetching subscription:', err)
    } finally {
      loading.value = false
    }
  }

  // Create subscription
  const createSubscription = async (
    subscriptionType: 'free' | 'premium' | 'pro',
    paymentMethod?: string
  ) => {
    if (!isAuthenticated.value || !user.value) {
      error.value = 'กรุณาเข้าสู่ระบบก่อน'
      return { success: false, error: 'กรุณาเข้าสู่ระบบก่อน' }
    }

    try {
      loading.value = true
      error.value = null

      // Calculate end date (30 days from now for premium/pro)
      const endDate = subscriptionType !== 'free' 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null

      const { data, error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.value.id,
          subscription_type: subscriptionType,
          status: 'active',
          end_date: endDate,
          payment_method: paymentMethod || null
        })
        .select()
        .single()

      if (insertError) throw insertError

      subscription.value = data
      return { success: true, data, error: null }
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการสร้างการสมัครสมาชิก'
      console.error('Error creating subscription:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Update subscription
  const updateSubscription = async (updates: Partial<Subscription>) => {
    if (!isAuthenticated.value || !user.value || !subscription.value) {
      error.value = 'ไม่พบข้อมูลการสมัครสมาชิก'
      return { success: false, error: 'ไม่พบข้อมูลการสมัครสมาชิก' }
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', subscription.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      subscription.value = data
      return { success: true, data, error: null }
    } catch (err: any) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการอัปเดตการสมัครสมาชิก'
      console.error('Error updating subscription:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Cancel subscription
  const cancelSubscription = async () => {
    return await updateSubscription({ 
      status: 'cancelled',
      auto_renew: false 
    })
  }

  // Check subscription status
  const hasActiveSubscription = computed(() => {
    return subscription.value?.status === 'active' && 
           (!subscription.value.end_date || new Date(subscription.value.end_date) > new Date())
  })

  const isPremium = computed(() => {
    return hasActiveSubscription.value && 
           (subscription.value?.subscription_type === 'premium' || 
            subscription.value?.subscription_type === 'pro')
  })

  const subscriptionType = computed(() => {
    return subscription.value?.subscription_type || 'free'
  })

  return {
    subscription: computed(() => subscription.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    hasActiveSubscription,
    isPremium,
    subscriptionType,
    fetchSubscription,
    createSubscription,
    updateSubscription,
    cancelSubscription
  }
}

