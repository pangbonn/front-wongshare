# ⚡ Quick Deploy Guide - Supabase Edge Function

คู่มือ deploy function แบบเร็ว

## 🚀 ขั้นตอน Deploy (Copy-Paste)

```powershell
# 1. ไปที่ root directory
cd C:\Users\pangb\OneDrive\Documents\GitHub\vue_blog

# 2. Login (ครั้งแรกเท่านั้น)
npx supabase@latest login

# 3. Link project (ครั้งแรกเท่านั้น)
npx supabase@latest link --project-ref kqvnouuzhuxjmnanvpqw

# 4. ตั้งค่า secrets (ครั้งแรกเท่านั้น)
npx supabase@latest secrets set RESEND_API_KEY=your-resend-api-key
npx supabase@latest secrets set RESEND_FROM_EMAIL=noreply@wongshare.com
npx supabase@latest secrets set SITE_URL=https://wongshare-5ed5c.web.app/
npx supabase@latest secrets set SUPABASE_URL=https://kqvnouuzhuxjmnanvpqw.supabase.co
npx supabase@latest secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 5. Deploy function
npx supabase@latest functions deploy send-email
```

## ⚠️ ข้อผิดพลาดที่พบบ่อย

### Error: "No matching version found for supabase@latetest"

**สาเหตุ**: พิมพ์ผิด `latetest` แทน `latest`

**วิธีแก้**: ตรวจสอบว่าพิมพ์ `supabase@latest` ถูกต้อง

```powershell
# ❌ ผิด
npx supabase@latetest init

# ✅ ถูก
npx supabase@latest init
```

### Error: "entrypoint path does not exist" หรือ path ซ้ำ

**สาเหตุ**: 
- รันคำสั่งจาก directory ผิด
- มีโฟลเดอร์ `supabase/` ซ้ำใน `supabase/functions/send-email/`

**วิธีแก้**: 

```powershell
# 1. ตรวจสอบ current directory
pwd

# 2. ไปที่ root directory
cd C:\Users\pangb\OneDrive\Documents\GitHub\vue_blog

# 3. ตรวจสอบว่าไฟล์มีอยู่
dir supabase\functions\send-email\index.ts

# 4. ถ้ามีโฟลเดอร์ supabase ซ้ำใน send-email ให้ลบออก
# ตรวจสอบก่อน:
dir supabase\functions\send-email\supabase

# ถ้ามี ให้ลบออก:
Remove-Item -Recurse -Force supabase\functions\send-email\supabase
```

**⚠️ ระวัง**: อย่ารัน `supabase init` จากภายในโฟลเดอร์ `functions/send-email/` เพราะจะสร้างโครงสร้างซ้ำ

### Error: "invalid character at start of key"

**สาเหตุ**: ไฟล์ `config.toml` มี syntax error

**วิธีแก้**: สร้างไฟล์ใหม่

```powershell
# ใช้ Supabase CLI สร้าง config.toml ใหม่
npx supabase@latest init
```

### Error: "Missing required field in config: project_id"

**สาเหตุ**: ไฟล์ `config.toml` ไม่มี `project_id` หรือว่างเปล่า

**วิธีแก้**: ใส่ project_id ใน config.toml

```powershell
# เปิดไฟล์ config.toml และแก้ไข
# project_id = "kqvnouuzhuxjmnanvpqw"
```

หรือใช้คำสั่ง link เพื่อตั้งค่า project_id อัตโนมัติ:

```powershell
npx supabase@latest link --project-ref kqvnouuzhuxjmnanvpqw
```

---

## ✅ Checklist

ก่อน deploy ตรวจสอบว่า:

- [ ] อยู่ใน root directory (`vue_blog`)
- [ ] พิมพ์ `supabase@latest` ถูกต้อง (ไม่ใช่ `latetest`)
- [ ] Login แล้ว
- [ ] Link project แล้ว
- [ ] ตั้งค่า secrets แล้ว
- [ ] ไฟล์ `supabase/functions/send-email/index.ts` มีอยู่

---

**Happy Deploying! 🎉**

