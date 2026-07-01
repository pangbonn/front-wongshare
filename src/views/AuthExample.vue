<template>
  <div class="min-h-screen bg-base-200 py-12 px-4">
    <div class="max-w-4xl mx-auto">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h1 class="card-title text-3xl mb-6">ตัวอย่างการใช้งาน Google Authentication</h1>
          
          <!-- Google Auth Button Example -->
          <div class="mb-8">
            <h2 class="text-xl font-semibold mb-4">1. Google Auth Button Component</h2>
            <div class="bg-base-200 p-6 rounded-lg">
              <GoogleAuthButton />
            </div>
          </div>

          <!-- User Info -->
          <div v-if="isAuthenticated" class="mb-8">
            <h2 class="text-xl font-semibold mb-4">2. ข้อมูลผู้ใช้</h2>
            <div class="bg-base-200 p-6 rounded-lg">
              <div class="space-y-4">
                <div>
                  <p class="text-sm text-gray-500">User ID:</p>
                  <p class="font-mono text-sm">{{ user?.id }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Email:</p>
                  <p>{{ user?.email }}</p>
                </div>
                <div v-if="profile">
                  <p class="text-sm text-gray-500">ชื่อ:</p>
                  <p>{{ profile.full_name || 'ยังไม่ได้ตั้งค่า' }}</p>
                </div>
                <div v-if="profile?.avatar_url">
                  <p class="text-sm text-gray-500">Avatar:</p>
                  <img :src="profile.avatar_url" alt="Avatar" class="w-20 h-20 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <!-- Usage Code Example -->
          <div class="mb-8">
            <h2 class="text-xl font-semibold mb-4">3. ตัวอย่างโค้ด</h2>
            <div class="bg-base-200 p-6 rounded-lg">
              <pre class="text-sm overflow-x-auto"><code>&lt;template&gt;
  &lt;GoogleAuthButton /&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import GoogleAuthButton from '@/components/GoogleAuthButton.vue'
import { useAuth } from '@/composables/useAuth'

const { user, profile, isAuthenticated } = useAuth()
&lt;/script&gt;</code></pre>
            </div>
          </div>

          <!-- Features List -->
          <div>
            <h2 class="text-xl font-semibold mb-4">4. ฟีเจอร์ที่พร้อมใช้งาน</h2>
            <ul class="list-disc list-inside space-y-2">
              <li>✅ เข้าสู่ระบบด้วย Google OAuth</li>
              <li>✅ สร้าง Profile อัตโนมัติเมื่อสมัครสมาชิก</li>
              <li>✅ แสดงข้อมูลผู้ใช้และ Avatar</li>
              <li>✅ ออกจากระบบ</li>
              <li>✅ Real-time auth state updates</li>
              <li>✅ Session persistence</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import GoogleAuthButton from '@/components/GoogleAuthButton.vue'
import { useAuth } from '@/composables/useAuth'

const { user, profile, isAuthenticated } = useAuth()
</script>

