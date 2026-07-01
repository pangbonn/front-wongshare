<template>
  <div class="email-preferences">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl mb-4">การตั้งค่าการรับอีเมล</h2>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-8">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <!-- Error Message -->
        <div v-else-if="error" class="alert alert-error mb-4">
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

        <!-- Email Preferences Form -->
        <div v-else-if="emailSubscription" class="space-y-6">
          <!-- Master Toggle -->
          <div class="form-control">
            <label class="label cursor-pointer">
              <div>
                <span class="label-text text-lg font-semibold">เปิดใช้งานการรับอีเมล</span>
                <p class="text-sm text-gray-500">เปิด/ปิดการรับอีเมลทั้งหมด</p>
              </div>
              <input
                type="checkbox"
                class="toggle toggle-primary"
                :checked="emailSubscription.enabled"
                @change="handleToggleAll"
              />
            </label>
          </div>

          <div class="divider"></div>

          <!-- Email Type Toggles -->
          <div class="space-y-4" :class="{ 'opacity-50': !emailSubscription.enabled }">
            <!-- Subscription Updates -->
            <div class="form-control">
              <label class="label cursor-pointer">
                <div>
                  <span class="label-text font-semibold">การอัปเดตการสมัครสมาชิก</span>
                  <p class="text-sm text-gray-500">
                    รับอีเมลเมื่อมีการเปลี่ยนแปลงสถานะการสมัครสมาชิก
                  </p>
                </div>
                <input
                  type="checkbox"
                  class="toggle toggle-primary"
                  :checked="emailSubscription.subscription_updates"
                  :disabled="!emailSubscription.enabled"
                  @change="handleToggle('subscription_updates')"
                />
              </label>
            </div>

            <!-- New Articles -->
            <div class="form-control">
              <label class="label cursor-pointer">
                <div>
                  <span class="label-text font-semibold">บทความใหม่</span>
                  <p class="text-sm text-gray-500">
                    รับอีเมลเมื่อมีบทความใหม่ที่เผยแพร่
                  </p>
                </div>
                <input
                  type="checkbox"
                  class="toggle toggle-primary"
                  :checked="emailSubscription.new_articles"
                  :disabled="!emailSubscription.enabled"
                  @change="handleToggle('new_articles')"
                />
              </label>
            </div>

            <!-- Weekly Digest -->
            <div class="form-control">
              <label class="label cursor-pointer">
                <div>
                  <span class="label-text font-semibold">สรุปบทความรายสัปดาห์</span>
                  <p class="text-sm text-gray-500">
                    รับอีเมลสรุปบทความยอดนิยมในแต่ละสัปดาห์
                  </p>
                </div>
                <input
                  type="checkbox"
                  class="toggle toggle-primary"
                  :checked="emailSubscription.weekly_digest"
                  :disabled="!emailSubscription.enabled"
                  @change="handleToggle('weekly_digest')"
                />
              </label>
            </div>

            <!-- Marketing Emails -->
            <div class="form-control">
              <label class="label cursor-pointer">
                <div>
                  <span class="label-text font-semibold">อีเมลการตลาด</span>
                  <p class="text-sm text-gray-500">
                    รับอีเมลเกี่ยวกับข่าวสารและโปรโมชันพิเศษ
                  </p>
                </div>
                <input
                  type="checkbox"
                  class="toggle toggle-primary"
                  :checked="emailSubscription.marketing_emails"
                  :disabled="!emailSubscription.enabled"
                  @change="handleToggle('marketing_emails')"
                />
              </label>
            </div>
          </div>

          <!-- Email Address -->
          <div class="form-control mt-6">
            <label class="label">
              <span class="label-text font-semibold">อีเมลที่ใช้รับการแจ้งเตือน</span>
            </label>
            <input
              type="email"
              class="input input-bordered"
              :value="emailSubscription.email"
              disabled
            />
            <label class="label">
              <span class="label-text-alt text-gray-500">
                อีเมลนี้จะใช้สำหรับการส่งการแจ้งเตือนทั้งหมด
              </span>
            </label>
          </div>

          <!-- Save Button -->
          <div class="card-actions justify-end mt-6">
            <button
              class="btn btn-primary"
              :disabled="loading"
              @click="handleSave"
            >
              <span v-if="saving" class="loading loading-spinner loading-sm"></span>
              บันทึกการตั้งค่า
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEmailSubscriptions } from '@/composables/useEmailSubscriptions'

const {
  emailSubscription,
  loading,
  error,
  fetchEmailSubscription,
  toggleEmailType,
  toggleAllEmails
} = useEmailSubscriptions()

const saving = ref(false)
const localSettings = ref<{
  subscription_updates?: boolean
  new_articles?: boolean
  weekly_digest?: boolean
  marketing_emails?: boolean
  enabled?: boolean
}>({})

onMounted(async () => {
  await fetchEmailSubscription()
  if (emailSubscription.value) {
    localSettings.value = {
      subscription_updates: emailSubscription.value.subscription_updates,
      new_articles: emailSubscription.value.new_articles,
      weekly_digest: emailSubscription.value.weekly_digest,
      marketing_emails: emailSubscription.value.marketing_emails,
      enabled: emailSubscription.value.enabled
    }
  }
})

const handleToggle = async (type: 'subscription_updates' | 'new_articles' | 'weekly_digest' | 'marketing_emails') => {
  if (!emailSubscription.value) return
  
  // Update local state immediately for better UX
  localSettings.value[type] = !emailSubscription.value[type]
  
  const result = await toggleEmailType(type)
  if (!result.success) {
    // Revert on error
    localSettings.value[type] = emailSubscription.value[type]
    alert('เกิดข้อผิดพลาด: ' + result.error)
  }
}

const handleToggleAll = async () => {
  if (!emailSubscription.value) return
  
  const newValue = !emailSubscription.value.enabled
  localSettings.value.enabled = newValue
  
  const result = await toggleAllEmails(newValue)
  if (!result.success) {
    localSettings.value.enabled = emailSubscription.value.enabled
    alert('เกิดข้อผิดพลาด: ' + result.error)
  }
}

const handleSave = async () => {
  if (!emailSubscription.value) return
  
  saving.value = true
  try {
    await fetchEmailSubscription()
    alert('บันทึกการตั้งค่าสำเร็จ!')
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการบันทึก')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.email-preferences {
  @apply max-w-2xl mx-auto p-4;
}
</style>

