# 🚀 คู่มือ Deploy Supabase Edge Function

คู่มือการ deploy Edge Function สำหรับส่งอีเมล

## ⚠️ ปัญหาที่พบบ่อย

**Error**: `entrypoint path does not exist (supabase/functions/send-email/index.ts)`

**สาเหตุ**: 
- รันคำสั่งจาก directory ผิด
- ไม่มีไฟล์ `supabase/config.toml`

---

## ✅ วิธีแก้ไข

### ขั้นตอนที่ 1: ตรวจสอบโครงสร้างโปรเจกต์

โครงสร้างที่ถูกต้อง:

```
vue_blog/
├── supabase/
│   ├── config.toml          ← ต้องมีไฟล์นี้!
│   ├── functions/
│   │   └── send-email/
│   │       └── index.ts     ← ไฟล์ Edge Function
│   └── migrations/
├── src/
├── package.json
└── ...
```

### ขั้นตอนที่ 2: ไปที่ Root Directory

```powershell
# ไปที่ root directory ของโปรเจกต์
cd C:\Users\pangb\OneDrive\Documents\GitHub\vue_blog

# ตรวจสอบว่าไฟล์มีอยู่
dir supabase\functions\send-email\index.ts
```

### ขั้นตอนที่ 3: ตรวจสอบไฟล์ config.toml

```powershell
# ตรวจสอบว่าไฟล์ config.toml มีอยู่
dir supabase\config.toml
```

**ถ้าไม่มีไฟล์หรือมี syntax error:**

```powershell
# วิธีที่ 1: ใช้ Supabase CLI สร้างไฟล์ (แนะนำ)
npx supabase@latest init

# วิธีที่ 2: ใช้ไฟล์ config.toml ที่มีอยู่แล้ว (ควรจะถูกต้องแล้ว)
```

**⚠️ ระวัง**: ต้องพิมพ์ `supabase@latest` (ไม่ใช่ `supabase@latetest`)

**ถ้าเจอ error "invalid character at start of key":**
- ตรวจสอบว่าไฟล์ `supabase/config.toml` ไม่มี syntax error
- ลองใช้ `npx supabase@latest init` เพื่อสร้างไฟล์ใหม่

**ถ้าเจอ error "No matching version found for supabase@latetest":**
- ตรวจสอบว่าพิมพ์ `supabase@latest` ถูกต้อง (ไม่ใช่ `latetest`)
- ลองลบ cache: `npm cache clean --force`

### ขั้นตอนที่ 4: Deploy Function

```powershell
# ใช้ npx (ไม่ต้องติดตั้ง CLI)
npx supabase@latest functions deploy send-email

# หรือถ้าติดตั้ง CLI แล้ว
supabase functions deploy send-email
```

---

## 🔧 การตั้งค่า Secrets

ก่อน deploy ต้องตั้งค่า secrets:

```powershell
# Login ก่อน (ถ้ายังไม่ได้ login)
npx supabase@latest login

# Link project (ถ้ายังไม่ได้ link)
npx supabase@latest link --project-ref your-project-ref

# ตั้งค่า secrets
npx supabase@latest secrets set RESEND_API_KEY=your-resend-api-key
npx supabase@latest secrets set RESEND_FROM_EMAIL=noreply@wongshare.com
npx supabase@latest secrets set SITE_URL=https://wongshare-5ed5c.web.app/
npx supabase@latest secrets set SUPABASE_URL=https://your-project.supabase.co
npx supabase@latest secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 📋 Checklist ก่อน Deploy

- [ ] อยู่ใน root directory ของโปรเจกต์ (`vue_blog`)
- [ ] มีไฟล์ `supabase/config.toml`
- [ ] มีไฟล์ `supabase/functions/send-email/index.ts`
- [ ] Login Supabase แล้ว (`npx supabase@latest login`)
- [ ] Link project แล้ว (`npx supabase@latest link`)
- [ ] ตั้งค่า secrets แล้ว

---

## 🐛 Troubleshooting

### Error: "Using workdir C:\Users\pangb"

**สาเหตุ**: รันคำสั่งจาก directory ผิด

**วิธีแก้**:
```powershell
cd C:\Users\pangb\OneDrive\Documents\GitHub\vue_blog
npx supabase@latest functions deploy send-email
```

### Error: "entrypoint path does not exist"

**สาเหตุ**: 
- ไฟล์ `index.ts` ไม่มีอยู่
- หรือรันคำสั่งจาก directory ผิด

**วิธีแก้**:
1. ตรวจสอบว่าไฟล์มีอยู่:
   ```powershell
   dir supabase\functions\send-email\index.ts
   ```
2. ตรวจสอบว่า path ถูกต้อง:
   ```powershell
   pwd  # ดู current directory
   ```
3. ไปที่ root directory:
   ```powershell
   cd C:\Users\pangb\OneDrive\Documents\GitHub\vue_blog
   ```

### Error: "project not linked"

**วิธีแก้**:
```powershell
npx supabase@latest login
npx supabase@latest link --project-ref your-project-ref
```

### Error: "secrets not set"

**วิธีแก้**:
```powershell
npx supabase@latest secrets set RESEND_API_KEY=your-key
# ... ตั้งค่า secrets อื่นๆ
```

---

## ✅ ตรวจสอบการ Deploy

หลังจาก deploy สำเร็จ:

1. ไปที่ **Supabase Dashboard > Edge Functions**
2. ควรเห็น function `send-email` ในรายการ
3. ทดสอบ function:
   ```powershell
   npx supabase@latest functions invoke send-email --body '{"to":"test@example.com","subject":"Test","html":"<h1>Test</h1>"}'
   ```

---

## 📚 เอกสารเพิ่มเติม

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase CLI Commands](https://supabase.com/docs/reference/cli/introduction)

---

**Happy Coding! 🎉**

