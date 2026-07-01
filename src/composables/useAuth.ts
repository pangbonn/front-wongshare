import { ref, computed } from 'vue'
import { supabase, type Profile } from '../../supabase/config'
import type { User, Session } from '@supabase/supabase-js'

const user = ref<User | null>(null)
const profile = ref<Profile | null>(null)
const session = ref<Session | null>(null)
const loading = ref(false)

export function useAuth() {
  // Initialize auth state
  const initAuth = async () => {
    try {
      loading.value = true
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      
      if (currentSession) {
        session.value = currentSession
        user.value = currentSession.user
        await fetchProfile(currentSession.user.id)
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      loading.value = false
    }
  }

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      profile.value = data
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      loading.value = true
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      console.error('Error signing in with Google:', error)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      loading.value = true
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      user.value = null
      profile.value = null
      session.value = null
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user.value) throw new Error('User not authenticated')

    try {
      loading.value = true
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.value.id)
        .select()
        .single()

      if (error) throw error
      profile.value = data
      return { data, error: null }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  // Update author profile
  const updateAuthorProfile = async (authorData: {
    is_author?: boolean
    author_bio?: string
    author_specialization?: string
    author_social_links?: Record<string, any>
    author_verified?: boolean
  }) => {
    if (!user.value) throw new Error('User not authenticated')

    return await updateProfile(authorData)
  }

  // Check if user is author
  const isAuthor = computed(() => {
    return profile.value?.is_author === true
  })

  // Listen to auth changes
  supabase.auth.onAuthStateChange(async (_event, currentSession) => {
    session.value = currentSession
    user.value = currentSession?.user ?? null

    if (currentSession?.user) {
      await fetchProfile(currentSession.user.id)
    } else {
      profile.value = null
    }
  })

  const isAuthenticated = computed(() => !!user.value)
  const isPremium = computed(() => {
    // This will be checked from subscription table
    return false // Placeholder
  })

  return {
    user: computed(() => user.value),
    profile: computed(() => profile.value),
    session: computed(() => session.value),
    loading: computed(() => loading.value),
    isAuthenticated,
    isPremium,
    isAuthor,
    initAuth,
    signInWithGoogle,
    signOut,
    updateProfile,
    updateAuthorProfile,
    fetchProfile
  }
}

