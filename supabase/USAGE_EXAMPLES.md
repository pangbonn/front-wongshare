# ตัวอย่างการใช้งาน Supabase Composables

คู่มือตัวอย่างการใช้งาน composables ต่างๆ ใน Vue Blog Application

## 🔐 Authentication (useAuth)

### ตัวอย่างการใช้งานใน Component

```vue
<template>
  <div>
    <div v-if="!isAuthenticated">
      <button @click="handleSignIn" class="btn btn-primary">
        เข้าสู่ระบบด้วย Google
      </button>
    </div>
    
    <div v-else>
      <div class="flex items-center gap-4">
        <img 
          v-if="profile?.avatar_url" 
          :src="profile.avatar_url" 
          :alt="profile.full_name || 'User'"
          class="w-10 h-10 rounded-full"
        />
        <div>
          <p class="font-semibold">{{ profile?.full_name || user?.email }}</p>
          <p class="text-sm text-gray-500">{{ user?.email }}</p>
        </div>
        <button @click="handleSignOut" class="btn btn-ghost">
          ออกจากระบบ
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { 
  user, 
  profile, 
  isAuthenticated, 
  loading,
  signInWithGoogle, 
  signOut,
  initAuth 
} = useAuth()

onMounted(async () => {
  await initAuth()
})

const handleSignIn = async () => {
  const { error } = await signInWithGoogle()
  if (error) {
    console.error('Sign in error:', error)
    alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
  }
}

const handleSignOut = async () => {
  try {
    await signOut()
    alert('ออกจากระบบสำเร็จ')
  } catch (error) {
    console.error('Sign out error:', error)
  }
}
</script>
```

---

## ⭐ Favorites (useFavorites)

### ตัวอย่างการใช้งานใน Article Component

```vue
<template>
  <div class="article-card">
    <h2>{{ article.title }}</h2>
    <p>{{ article.excerpt }}</p>
    
    <button 
      @click="handleToggleFavorite"
      :class="['btn', isArticleFavorited ? 'btn-error' : 'btn-outline']"
      :disabled="loading"
    >
      <span v-if="isArticleFavorited">❤️ ลบออกจากรายการโปรด</span>
      <span v-else>🤍 เพิ่มในรายการโปรด</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFavorites } from '@/composables/useFavorites'

const props = defineProps<{
  articleId: string
}>()

const { 
  loading,
  toggleFavorite,
  isFavorited 
} = useFavorites()

const isArticleFavorited = ref(false)

onMounted(async () => {
  isArticleFavorited.value = await isFavorited(props.articleId)
})

const handleToggleFavorite = async () => {
  const result = await toggleFavorite(props.articleId)
  if (result.success) {
    isArticleFavorited.value = !isArticleFavorited.value
  } else {
    alert(result.error || 'เกิดข้อผิดพลาด')
  }
}
</script>
```

### ตัวอย่างหน้า Favorites List

```vue
<template>
  <div class="favorites-page">
    <h1 class="text-2xl font-bold mb-4">รายการโปรดของฉัน</h1>
    
    <div v-if="loading" class="loading">กำลังโหลด...</div>
    
    <div v-else-if="favorites.length === 0" class="empty-state">
      <p>คุณยังไม่มีรายการโปรด</p>
    </div>
    
    <div v-else class="favorites-list">
      <div 
        v-for="favorite in favorites" 
        :key="favorite.id"
        class="favorite-item"
      >
        <router-link :to="`/article/${favorite.slug}`">
          <h3>{{ favorite.title }}</h3>
          <p>{{ favorite.excerpt }}</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useFavorites } from '@/composables/useFavorites'

const { favorites, loading, fetchFavorites } = useFavorites()

onMounted(async () => {
  await fetchFavorites()
})
</script>
```

---

## 💳 Subscriptions (useSubscriptions)

### ตัวอย่างหน้า Subscription Management

```vue
<template>
  <div class="subscription-page">
    <h1 class="text-2xl font-bold mb-4">การสมัครสมาชิก</h1>
    
    <div v-if="loading" class="loading">กำลังโหลด...</div>
    
    <div v-else-if="subscription" class="subscription-info">
      <div class="card">
        <h2>แผนปัจจุบัน: {{ subscriptionType }}</h2>
        <p>สถานะ: {{ subscription.status }}</p>
        <p v-if="subscription.end_date">
          วันหมดอายุ: {{ new Date(subscription.end_date).toLocaleDateString('th-TH') }}
        </p>
        
        <div v-if="hasActiveSubscription && subscription.subscription_type !== 'free'">
          <button @click="handleCancel" class="btn btn-error">
            ยกเลิกการสมัครสมาชิก
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="!isPremium" class="upgrade-section">
      <h3>อัปเกรดเป็น Premium</h3>
      <button @click="handleUpgrade" class="btn btn-primary">
        สมัคร Premium
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSubscriptions } from '@/composables/useSubscriptions'

const { 
  subscription,
  subscriptionType,
  hasActiveSubscription,
  isPremium,
  loading,
  fetchSubscription,
  createSubscription,
  cancelSubscription
} = useSubscriptions()

onMounted(async () => {
  await fetchSubscription()
})

const handleUpgrade = async () => {
  const result = await createSubscription('premium', 'credit_card')
  if (result.success) {
    alert('อัปเกรดเป็น Premium สำเร็จ!')
    await fetchSubscription()
  } else {
    alert(result.error || 'เกิดข้อผิดพลาด')
  }
}

const handleCancel = async () => {
  if (confirm('คุณต้องการยกเลิกการสมัครสมาชิกหรือไม่?')) {
    const result = await cancelSubscription()
    if (result.success) {
      alert('ยกเลิกการสมัครสมาชิกสำเร็จ')
      await fetchSubscription()
    } else {
      alert(result.error || 'เกิดข้อผิดพลาด')
    }
  }
}
</script>
```

---

## 🔔 Notifications (useNotifications)

### ตัวอย่าง Notification Bell Component

```vue
<template>
  <div class="notification-bell">
    <button 
      @click="showDropdown = !showDropdown"
      class="btn btn-ghost relative"
    >
      🔔
      <span 
        v-if="unreadCount > 0"
        class="badge badge-error badge-sm absolute -top-1 -right-1"
      >
        {{ unreadCount }}
      </span>
    </button>
    
    <div v-if="showDropdown" class="dropdown-content">
      <div class="notification-header">
        <h3>การแจ้งเตือน</h3>
        <button 
          v-if="unreadCount > 0"
          @click="handleMarkAllRead"
          class="btn btn-sm"
        >
          ทำเครื่องหมายว่าอ่านทั้งหมด
        </button>
      </div>
      
      <div v-if="loading" class="loading">กำลังโหลด...</div>
      
      <div v-else-if="notifications.length === 0" class="empty">
        ไม่มีการแจ้งเตือน
      </div>
      
      <div v-else class="notifications-list">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          :class="['notification-item', { 'unread': !notification.read }]"
          @click="handleNotificationClick(notification)"
        >
          <h4>{{ notification.title }}</h4>
          <p>{{ notification.message }}</p>
          <span class="time">{{ formatTime(notification.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotifications } from '@/composables/useNotifications'
import type { Notification } from '../../supabase/config'

const { 
  notifications,
  unreadCount,
  loading,
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  subscribeToNotifications
} = useNotifications()

const showDropdown = ref(false)

onMounted(async () => {
  await fetchNotifications()
  // Subscribe to real-time updates
  const unsubscribe = subscribeToNotifications()
  onUnmounted(() => {
    if (unsubscribe) unsubscribe()
  })
})

const handleNotificationClick = async (notification: Notification) => {
  if (!notification.read) {
    await markAsRead(notification.id)
  }
  
  if (notification.link) {
    window.location.href = notification.link
  }
  
  showDropdown.value = false
}

const handleMarkAllRead = async () => {
  await markAllAsRead()
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'เมื่อสักครู่'
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`
  return `${days} วันที่แล้ว`
}
</script>

<style scoped>
.notification-item {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
}

.notification-item.unread {
  background-color: #eff6ff;
}

.notification-item:hover {
  background-color: #f3f4f6;
}
</style>
```

---

## 🔄 การใช้งานร่วมกันหลาย Composables

### ตัวอย่างหน้า Dashboard

```vue
<template>
  <div class="dashboard">
    <div v-if="!isAuthenticated" class="login-prompt">
      <p>กรุณาเข้าสู่ระบบเพื่อดู Dashboard</p>
      <button @click="handleSignIn" class="btn btn-primary">
        เข้าสู่ระบบด้วย Google
      </button>
    </div>
    
    <div v-else>
      <h1>Dashboard</h1>
      
      <!-- User Info -->
      <div class="user-info">
        <h2>ข้อมูลผู้ใช้</h2>
        <p>ชื่อ: {{ profile?.full_name }}</p>
        <p>อีเมล: {{ user?.email }}</p>
      </div>
      
      <!-- Subscription Status -->
      <div class="subscription-status">
        <h2>สถานะการสมัครสมาชิก</h2>
        <p>แผน: {{ subscriptionType }}</p>
        <p v-if="isPremium">✨ คุณเป็นสมาชิก Premium!</p>
      </div>
      
      <!-- Favorites Count -->
      <div class="favorites-count">
        <h2>รายการโปรด</h2>
        <p>จำนวน: {{ favorites.length }} รายการ</p>
      </div>
      
      <!-- Notifications -->
      <div class="notifications-section">
        <h2>การแจ้งเตือน</h2>
        <p>ยังไม่อ่าน: {{ unreadCount }} รายการ</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useFavorites } from '@/composables/useFavorites'
import { useSubscriptions } from '@/composables/useSubscriptions'
import { useNotifications } from '@/composables/useNotifications'

const { isAuthenticated, user, profile, signInWithGoogle, initAuth } = useAuth()
const { favorites, fetchFavorites } = useFavorites()
const { subscriptionType, isPremium, fetchSubscription } = useSubscriptions()
const { unreadCount, fetchNotifications } = useNotifications()

onMounted(async () => {
  await initAuth()
  
  if (isAuthenticated.value) {
    await Promise.all([
      fetchFavorites(),
      fetchSubscription(),
      fetchNotifications()
    ])
  }
})

const handleSignIn = async () => {
  await signInWithGoogle()
}
</script>
```

---

## 💡 Tips & Best Practices

1. **Always check authentication**: ตรวจสอบว่า user login แล้วก่อนใช้งาน composables ที่ต้องการ authentication

2. **Handle loading states**: ใช้ `loading` state เพื่อแสดง loading indicator

3. **Error handling**: จัดการ error อย่างเหมาะสมและแสดงข้อความให้ผู้ใช้ทราบ

4. **Real-time updates**: ใช้ `subscribeToNotifications()` สำหรับการแจ้งเตือนแบบ real-time

5. **Cleanup**: อย่าลืม unsubscribe เมื่อ component unmount

6. **Type safety**: ใช้ TypeScript types ที่มีให้เพื่อ type safety

---

**Happy Coding! 🎉**

