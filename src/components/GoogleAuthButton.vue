<template>
  <div class="google-auth-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <span class="loading loading-spinner loading-md"></span>
      <span class="ml-2">กำลังเข้าสู่ระบบ...</span>
    </div>

    <!-- Not Authenticated - Compact version for Header -->
    <button
      v-else-if="!isAuthenticated"
      @click="handleSignIn"
      class="btn btn-primary btn-sm sm:btn-md"
      :disabled="loading"
    >
      <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <span class="hidden sm:inline">เข้าสู่ระบบ</span>
      <span class="sm:hidden">Login</span>
    </button>

    <!-- Authenticated - Compact version for Header -->
    <div v-else class="user-profile-compact">
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full">
            <img
              v-if="profile?.avatar_url"
              :src="profile.avatar_url"
              :alt="profile.full_name || user?.email || 'User'"
              class="w-full h-full rounded-full object-cover"
            />
            <div
              v-else
              class="w-full h-full rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-semibold"
            >
              {{ getInitials(profile?.full_name || user?.email || 'U') }}
            </div>
          </div>
        </div>
        <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg border border-base-300">
          <li class="menu-title">
            <span>{{ profile?.full_name || user?.email || 'ผู้ใช้' }}</span>
            <span v-if="profile?.full_name && user?.email" class="text-xs text-gray-500">
              {{ user.email }}
            </span>
          </li>
          <li><a @click="handleSignOut" :class="{ 'opacity-50': loading }">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            ออกจากระบบ
          </a></li>
        </ul>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="alert alert-error mt-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { user, profile, isAuthenticated, loading, signInWithGoogle, signOut } = useAuth()

const error = ref<string | null>(null)

const handleSignIn = async () => {
  try {
    error.value = null
    const result = await signInWithGoogle()
    
    if (result.error) {
      error.value = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองอีกครั้ง'
      console.error('Sign in error:', result.error)
    }
    // ถ้าสำเร็จ จะ redirect ไปที่ Google OAuth page
  } catch (err: any) {
    error.value = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองอีกครั้ง'
    console.error('Sign in error:', err)
  }
}

const handleSignOut = async () => {
  try {
    error.value = null
    await signOut()
  } catch (err: any) {
    error.value = 'เกิดข้อผิดพลาดในการออกจากระบบ'
    console.error('Sign out error:', err)
  }
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    const first = parts[0]
    const last = parts[parts.length - 1]
    if (first && last && first[0] && last[0]) {
      return (first[0] + last[0]).toUpperCase()
    }
  }
  return name.substring(0, 2).toUpperCase()
}
</script>

<style scoped>
.google-auth-container {
  @apply flex items-center;
}

.loading {
  @apply flex items-center justify-center py-2;
}

.user-profile-compact {
  @apply flex items-center;
}
</style>

