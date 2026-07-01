# 🚀 Quick Start Guide - Supabase Setup

คู่มือเริ่มต้นใช้งาน Supabase สำหรับ Vue Blog Application

## ⚡ ขั้นตอนด่วน (5 นาที)

### 1. ติดตั้ง Dependencies

```bash
npm install @supabase/supabase-js
```

### 2. สร้างโปรเจกต์ Supabase

1. ไปที่ [supabase.com](https://supabase.com) และสร้างโปรเจกต์
2. รอให้โปรเจกต์สร้างเสร็จ (~2-3 นาที)

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ใน root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

หา URL และ Key ได้ที่: **Supabase Dashboard > Settings > API**

### 4. รัน Database Migration

1. ไปที่ **Supabase Dashboard > SQL Editor**
2. เปิดไฟล์ `supabase/migrations/001_initial_schema.sql`
3. คัดลอกเนื้อหาทั้งหมด
4. วางใน SQL Editor และคลิก **Run**

### 5. ตั้งค่า Google OAuth

1. สร้าง OAuth credentials ที่ [Google Cloud Console](https://console.cloud.google.com/)
2. ตั้งค่า Redirect URI: `https://your-project.supabase.co/auth/v1/callback`
3. ไปที่ **Supabase Dashboard > Authentication > Providers > Google**
4. เปิดใช้งานและใส่ Client ID + Client Secret

### 6. เริ่มใช้งาน!

```typescript
import { useAuth } from '@/composables/useAuth'

const { signInWithGoogle, isAuthenticated } = useAuth()
```

---

## 📁 โครงสร้างไฟล์ที่สร้างขึ้น

```
supabase/
├── migrations/
│   └── 001_initial_schema.sql    # Database schema
├── config.ts                      # Supabase client config
├── README.md                      # คู่มือฉบับเต็ม
├── USAGE_EXAMPLES.md              # ตัวอย่างการใช้งาน
└── QUICK_START.md                 # คู่มือนี้

src/
├── composables/
│   ├── useAuth.ts                 # Authentication
│   ├── useFavorites.ts            # Favorites management
│   ├── useSubscriptions.ts        # Subscription management
│   └── useNotifications.ts        # Notifications
└── router/
    └── auth-callback.ts           # OAuth callback handler
```

---

## 🎯 Features ที่พร้อมใช้งาน

✅ **Google Authentication** - เข้าสู่ระบบด้วย Google  
✅ **Favorites** - บันทึกบทความโปรด  
✅ **Subscriptions** - ระบบสมัครสมาชิก (Free/Premium/Pro)  
✅ **Notifications** - ระบบแจ้งเตือนแบบ real-time  
✅ **Row Level Security** - ความปลอดภัยระดับแถว  
✅ **Auto Profile Creation** - สร้าง profile อัตโนมัติเมื่อสมัครสมาชิก  

---

## 📚 เอกสารเพิ่มเติม

- [README.md](./README.md) - คู่มือฉบับเต็ม
- [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) - ตัวอย่างการใช้งาน

---

## 🆘 ปัญหาที่พบบ่อย

**Q: "Invalid API key" error**  
A: ตรวจสอบว่า `.env` ถูกต้องและรีสตาร์ท dev server

**Q: Google OAuth ไม่ทำงาน**  
A: ตรวจสอบ Redirect URI ใน Google Cloud Console ต้องตรงกับ Supabase callback URL

**Q: Permission denied**  
A: ตรวจสอบว่า user login แล้วและ RLS policies ถูกตั้งค่าถูกต้อง

---

**พร้อมใช้งานแล้ว! 🎉**

