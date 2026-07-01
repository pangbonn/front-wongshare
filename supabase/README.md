# Supabase Database Setup Guide

คู่มือการตั้งค่า Supabase Database สำหรับ Vue Blog Application

## ⚠️ สถานะปัจจุบัน

**สำคัญ**: Supabase database ที่สร้างไว้ยังไม่ได้เชื่อมต่อกับแอปจริง

**ระบบปัจจุบัน:**
- ✅ ใช้ Google Apps Script + Google Sheets สำหรับเก็บข้อมูลบทความ
- ✅ Supabase schema สร้างเสร็จแล้ว (ยังไม่ได้ใช้งาน)

**ดูคู่มือ Migration**: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

## 📋 สารบัญ

1. [การติดตั้ง Supabase](#การติดตั้ง-supabase)
2. [การตั้งค่า Google OAuth](#การตั้งค่า-google-oauth)
3. [การรัน Migration](#การรัน-migration)
4. [การตั้งค่า Environment Variables](#การตั้งค่า-environment-variables)
5. [การใช้งาน Composables](#การใช้งาน-composables)

---

## 🚀 การติดตั้ง Supabase

### 1. สร้างโปรเจกต์ Supabase

1. ไปที่ [https://supabase.com](https://supabase.com)
2. สร้างบัญชีหรือเข้าสู่ระบบ
3. คลิก "New Project"
4. กรอกข้อมูลโปรเจกต์:
   - **Name**: ชื่อโปรเจกต์ของคุณ
   - **Database Password**: รหัสผ่านฐานข้อมูล (เก็บไว้ให้ดี!)
   - **Region**: เลือก region ที่ใกล้ที่สุด
5. รอให้โปรเจกต์สร้างเสร็จ (ประมาณ 2-3 นาที)

### 2. ติดตั้ง Supabase Client

```bash
npm install @supabase/supabase-js
```

---

## 🔐 การตั้งค่า Google OAuth

### 1. สร้าง Google OAuth Credentials

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้างโปรเจกต์ใหม่หรือเลือกโปรเจกต์ที่มีอยู่
3. ไปที่ **APIs & Services** > **Credentials**
4. คลิก **Create Credentials** > **OAuth client ID**
5. เลือก **Web application**
6. ตั้งค่า:
   - **Name**: ชื่อ OAuth client
   - **Authorized JavaScript origins**: 
     - `http://localhost:5173` (สำหรับ development)
     - `https://your-project.supabase.co` (Supabase URL)
   - **Authorized redirect URIs**:
     - `https://your-project.supabase.co/auth/v1/callback`
     - `http://localhost:5173/auth/callback` (สำหรับ development)
7. คลิก **Create** และบันทึก **Client ID** และ **Client Secret**

### 2. ตั้งค่าใน Supabase Dashboard

1. ไปที่ Supabase Dashboard > **Authentication** > **Providers**
2. คลิก **Google**
3. เปิดใช้งาน Google provider
4. ใส่ **Client ID** และ **Client Secret** ที่ได้จาก Google Cloud Console
5. คลิก **Save**

---

## 📊 การรัน Migration

### วิธีที่ 1: ใช้ Supabase Dashboard (แนะนำ)

1. ไปที่ Supabase Dashboard > **SQL Editor**
2. คลิก **New query**
3. เปิดไฟล์ `supabase/migrations/001_initial_schema.sql`
4. คัดลอกเนื้อหาทั้งหมด
5. วางใน SQL Editor
6. คลิก **Run** หรือกด `Ctrl+Enter`

### วิธีที่ 2: ใช้ Supabase CLI

```bash
# ติดตั้ง Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

---

## 🔧 การตั้งค่า Environment Variables

สร้างไฟล์ `.env` ใน root directory ของโปรเจกต์:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### วิธีหา Supabase URL และ Anon Key

1. ไปที่ Supabase Dashboard > **Settings** > **API**
2. คัดลอก:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### ตัวอย่างไฟล์ `.env`

```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example
```

⚠️ **สำคัญ**: อย่า commit ไฟล์ `.env` ลงใน Git! ตรวจสอบว่าไฟล์อยู่ใน `.gitignore`

---

## 📚 การใช้งาน Composables

### 1. Authentication (useAuth)

```typescript
import { useAuth } from '@/composables/useAuth'

const { 
  user, 
  profile, 
  isAuthenticated, 
  signInWithGoogle, 
  signOut 
} = useAuth()

// Initialize auth on app start
await initAuth()

// Sign in with Google
await signInWithGoogle()

// Sign out
await signOut()
```

### 2. Favorites (useFavorites)

```typescript
import { useFavorites } from '@/composables/useFavorites'

const { 
  favorites, 
  addFavorite, 
  removeFavorite, 
  toggleFavorite,
  isFavorited 
} = useFavorites()

// Fetch favorites
await fetchFavorites()

// Add favorite
await addFavorite(articleId)

// Remove favorite
await removeFavorite(articleId)

// Toggle favorite
await toggleFavorite(articleId)

// Check if favorited
const favorited = await isFavorited(articleId)
```

### 3. Subscriptions (useSubscriptions)

```typescript
import { useSubscriptions } from '@/composables/useSubscriptions'

const { 
  subscription, 
  isPremium, 
  createSubscription, 
  cancelSubscription 
} = useSubscriptions()

// Fetch subscription
await fetchSubscription()

// Create premium subscription
await createSubscription('premium', 'credit_card')

// Cancel subscription
await cancelSubscription()
```

### 4. Notifications (useNotifications)

```typescript
import { useNotifications } from '@/composables/useNotifications'

const { 
  notifications, 
  unreadCount, 
  markAsRead, 
  markAllAsRead 
} = useNotifications()

// Fetch notifications
await fetchNotifications()

// Mark as read
await markAsRead(notificationId)

// Mark all as read
await markAllAsRead()

// Subscribe to real-time updates
const unsubscribe = subscribeToNotifications()
```

---

## 🗄️ Database Schema Overview

### Tables

1. **profiles** - ข้อมูลโปรไฟล์ผู้ใช้
2. **articles** - บทความ
3. **favorites** - รายการโปรด
4. **subscriptions** - การสมัครสมาชิก
5. **notifications** - การแจ้งเตือน

### Views

1. **user_favorites_view** - รายการโปรดพร้อมข้อมูลบทความ
2. **user_notifications_count** - จำนวนการแจ้งเตือน

### Functions & Triggers

- `handle_new_user()` - สร้าง profile อัตโนมัติเมื่อผู้ใช้สมัครสมาชิก
- `create_default_subscription()` - สร้าง subscription ฟรีอัตโนมัติ
- `handle_updated_at()` - อัปเดต timestamp อัตโนมัติ

---

## 🔒 Row Level Security (RLS)

ทุกตารางมี RLS เปิดใช้งานและมี policies ที่เหมาะสม:

- ผู้ใช้สามารถดูข้อมูลของตัวเองได้
- ผู้ใช้สามารถแก้ไขข้อมูลของตัวเองได้
- บทความที่เผยแพร่แล้วทุกคนดูได้
- บทความที่ยังไม่เผยแพร่เฉพาะเจ้าของดูได้

---

## 🐛 Troubleshooting

### ปัญหา: "Invalid API key"

- ตรวจสอบว่า `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY` ถูกต้อง
- ตรวจสอบว่าไฟล์ `.env` อยู่ใน root directory
- รีสตาร์ท dev server หลังจากแก้ไข `.env`

### ปัญหา: "Google OAuth ไม่ทำงาน"

- ตรวจสอบว่า redirect URI ใน Google Cloud Console ตรงกับ Supabase callback URL
- ตรวจสอบว่า Client ID และ Client Secret ถูกต้อง
- ตรวจสอบว่า Google provider เปิดใช้งานใน Supabase Dashboard

### ปัญหา: "Permission denied"

- ตรวจสอบว่า RLS policies ถูกตั้งค่าถูกต้อง
- ตรวจสอบว่า user ได้ login แล้ว
- ตรวจสอบว่า user_id ตรงกับ auth.uid()

---

## 📞 Support

หากมีปัญหาหรือคำถาม สามารถ:
- ดูเอกสาร Supabase: [https://supabase.com/docs](https://supabase.com/docs)
- ดูเอกสาร Vue: [https://vuejs.org](https://vuejs.org)

---

**Happy Coding! 🎉**

