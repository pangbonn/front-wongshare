# 🔐 คู่มือตั้งค่า Google Authentication

คู่มือฉบับละเอียดสำหรับการตั้งค่า Google OAuth ใน Supabase

## 📋 สารบัญ

1. [การสร้าง Google OAuth Credentials](#การสร้าง-google-oauth-credentials)
2. [การตั้งค่าใน Supabase](#การตั้งค่าใน-supabase)
3. [การทดสอบ](#การทดสอบ)
4. [Troubleshooting](#troubleshooting)

---

## 🔑 การสร้าง Google OAuth Credentials

### ขั้นตอนที่ 1: สร้างโปรเจกต์ใน Google Cloud Console

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. คลิก **Select a project** > **New Project**
3. ตั้งชื่อโปรเจกต์ (เช่น: "Vue Blog App")
4. คลิก **Create**

### ขั้นตอนที่ 2: เปิดใช้งาน Google+ API

1. ไปที่ **APIs & Services** > **Library**
2. ค้นหา "Google+ API"
3. คลิก **Enable** (ถ้ายังไม่ได้เปิดใช้งาน)

### ขั้นตอนที่ 3: สร้าง OAuth 2.0 Credentials

1. ไปที่ **APIs & Services** > **Credentials**
2. คลิก **+ CREATE CREDENTIALS** > **OAuth client ID**
3. ถ้ายังไม่ได้ตั้งค่า OAuth consent screen:
   - คลิก **Configure Consent Screen**
   - เลือก **External** (สำหรับการทดสอบ) หรือ **Internal** (สำหรับ Google Workspace)
   - กรอกข้อมูล:
     - **App name**: ชื่อแอปของคุณ
     - **User support email**: อีเมลของคุณ
     - **Developer contact information**: อีเมลของคุณ
   - คลิก **Save and Continue**
   - ข้าม Scopes (ไม่ต้องเพิ่ม)
   - ข้าม Test users (ไม่ต้องเพิ่ม)
   - คลิก **Back to Dashboard**

4. กลับไปที่ **Credentials** > **+ CREATE CREDENTIALS** > **OAuth client ID**
5. เลือก **Web application**
6. ตั้งชื่อ (เช่น: "Vue Blog Web Client")
7. **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   https://your-project.supabase.co
   ```
   (เปลี่ยน `your-project` เป็น Supabase project ของคุณ)

8. **Authorized redirect URIs**:
   ```
   https://your-project.supabase.co/auth/v1/callback
   http://localhost:5173/auth/callback
   ```
   (เปลี่ยน `your-project` เป็น Supabase project ของคุณ)

9. คลิก **Create**
10. **บันทึก Client ID และ Client Secret** ไว้ (จะใช้ในขั้นตอนถัดไป)

---

## ⚙️ การตั้งค่าใน Supabase

### ขั้นตอนที่ 1: เปิดใช้งาน Google Provider

1. ไปที่ **Supabase Dashboard** > **Authentication** > **Providers**
2. คลิก **Google**
3. เปิดสวิตช์ **Enable Google provider**
4. ใส่ข้อมูล:
   - **Client ID (for OAuth)**: ใส่ Client ID ที่ได้จาก Google Cloud Console
   - **Client Secret (for OAuth)**: ใส่ Client Secret ที่ได้จาก Google Cloud Console
5. คลิก **Save**

### ขั้นตอนที่ 2: ตั้งค่า Site URL

1. ไปที่ **Supabase Dashboard** > **Settings** > **API**
2. ตรวจสอบ **Site URL**:
   - สำหรับ development: `http://localhost:5173`
   - สำหรับ production: URL ของเว็บไซต์คุณ
3. **Redirect URLs**: เพิ่ม URL ที่อนุญาต:
   ```
   http://localhost:5173/**
   https://your-domain.com/**
   ```

---

## 🧪 การทดสอบ

### 1. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ใน root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. รัน Development Server

```bash
npm run dev
```

### 3. ทดสอบการ Login

1. เปิดเบราว์เซอร์ไปที่ `http://localhost:5173`
2. คลิกปุ่ม "เข้าสู่ระบบด้วย Google"
3. ควรจะ redirect ไปที่ Google login page
4. เลือกบัญชี Google
5. อนุญาตการเข้าถึง
6. ควรจะ redirect กลับมาที่แอปและ login สำเร็จ

---

## 🐛 Troubleshooting

### ปัญหา: "redirect_uri_mismatch" error

**สาเหตุ**: Redirect URI ใน Google Cloud Console ไม่ตรงกับที่ Supabase ใช้

**วิธีแก้**:
1. ตรวจสอบ Redirect URI ใน Google Cloud Console ต้องมี:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
2. ตรวจสอบว่า Supabase project URL ถูกต้อง
3. รอสักครู่ (อาจใช้เวลาสักพักในการอัปเดต)

### ปัญหา: "Access blocked: This app's request is invalid"

**สาเหตุ**: OAuth consent screen ยังไม่ได้ตั้งค่าถูกต้อง

**วิธีแก้**:
1. ไปที่ Google Cloud Console > **APIs & Services** > **OAuth consent screen**
2. ตรวจสอบว่าตั้งค่าครบถ้วนแล้ว
3. ถ้าใช้ **External** mode:
   - ต้องเพิ่ม **Test users** (อีเมล Google ที่จะใช้ทดสอบ)
   - หรือ publish app (ต้องผ่านการตรวจสอบ)

### ปัญหา: "Invalid client" error

**สาเหตุ**: Client ID หรือ Client Secret ไม่ถูกต้อง

**วิธีแก้**:
1. ตรวจสอบว่า Client ID และ Client Secret ใน Supabase Dashboard ถูกต้อง
2. คัดลอกใหม่จาก Google Cloud Console
3. ตรวจสอบว่าไม่มีช่องว่างหรือตัวอักษรพิเศษ

### ปัญหา: Login สำเร็จแต่ไม่ redirect กลับมา

**สาเหตุ**: Redirect URL ใน Supabase ไม่ถูกต้อง

**วิธีแก้**:
1. ไปที่ **Supabase Dashboard** > **Settings** > **API**
2. ตรวจสอบ **Redirect URLs** ต้องมี:
   ```
   http://localhost:5173/**
   ```
3. ตรวจสอบ route `/auth/callback` ใน router ถูกต้อง

### ปัญหา: "Profile not found" error

**สาเหตุ**: Database migration ยังไม่ได้รัน

**วิธีแก้**:
1. ไปที่ **Supabase Dashboard** > **SQL Editor**
2. รัน migration จาก `supabase/migrations/001_initial_schema.sql`
3. ตรวจสอบว่า trigger `on_auth_user_created` ทำงานถูกต้อง

---

## ✅ Checklist

ก่อนใช้งาน Google Authentication ตรวจสอบว่า:

- [ ] สร้าง Google Cloud Project แล้ว
- [ ] เปิดใช้งาน Google+ API แล้ว
- [ ] สร้าง OAuth 2.0 Credentials แล้ว
- [ ] ตั้งค่า OAuth consent screen แล้ว
- [ ] เพิ่ม Authorized JavaScript origins แล้ว
- [ ] เพิ่ม Authorized redirect URIs แล้ว
- [ ] เปิดใช้งาน Google provider ใน Supabase แล้ว
- [ ] ใส่ Client ID และ Client Secret ใน Supabase แล้ว
- [ ] ตั้งค่า Site URL และ Redirect URLs ใน Supabase แล้ว
- [ ] รัน database migration แล้ว
- [ ] ตั้งค่า environment variables แล้ว
- [ ] ทดสอบการ login สำเร็จแล้ว

---

## 📚 เอกสารเพิ่มเติม

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google Provider Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)

---

**Happy Coding! 🎉**

