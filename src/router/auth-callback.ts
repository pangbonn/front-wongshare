import { supabase } from '../../supabase/config'

// Handle OAuth callback
export async function handleAuthCallback() {
  try {
    // Handle the OAuth callback from the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    
    if (accessToken && refreshToken) {
      // Set the session
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })
      
      if (error) {
        console.error('Error setting session:', error)
        return { success: false, error }
      }

      if (data.session) {
        // Clear the hash from URL
        window.history.replaceState({}, document.title, window.location.pathname)
        return { success: true, session: data.session }
      }
    }

    // Fallback: Try to get existing session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting session:', error)
      return { success: false, error }
    }

    if (session) {
      return { success: true, session }
    }

    return { success: false, error: 'No session found' }
  } catch (error: any) {
    console.error('Error handling auth callback:', error)
    return { success: false, error }
  }
}

