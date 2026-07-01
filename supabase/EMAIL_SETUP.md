# 📧 คู่มือตั้งค่าระบบส่งอีเมล

คู่มือการตั้งค่าระบบส่งอีเมลแจ้งเตือนสำหรับ Vue Blog Application

## 📋 สารบัญ

1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [การตั้งค่า Resend API](#การตั้งค่า-resend-api)
3. [การตั้งค่า Supabase Edge Function](#การตั้งค่า-supabase-edge-function)
4. [การรัน Migration](#การรัน-migration)
5. [การทดสอบ](#การทดสอบ)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 ภาพรวมระบบ

ระบบส่งอีเมลประกอบด้วย:

1. **Email Subscriptions Table** - เก็บการตั้งค่าการรับอีเมลของผู้ใช้
2. **Email Logs Table** - เก็บ log การส่งอีเมล
3. **Database Triggers** - ส่งอีเมลอัตโนมัติเมื่อ:
   - มีการอัปเดต subscription
   - มีบทความใหม่ที่เผยแพร่
4. **Supabase Edge Function** - ฟังก์ชันสำหรับส่งอีเมลผ่าน Resend API

---

## 🔑 การตั้งค่า Resend API

### ขั้นตอนที่ 1: สร้างบัญชี Resend

1. ไปที่ [resend.com](https://resend.com)
2. สร้างบัญชีใหม่ (ฟรี tier มี 3,000 อีเมล/เดือน)
3. ยืนยันอีเมล

### ขั้นตอนที่ 2: สร้าง API Key

1. ไปที่ **API Keys** ใน dashboard
2. คลิก **Create API Key**
3. ตั้งชื่อ (เช่น: "Vue Blog Production")
4. เลือก permission: **Sending access**
5. คลิก **Create**
6. **บันทึก API Key** ไว้ (จะใช้ในขั้นตอนถัดไป)

### ขั้นตอนที่ 3: ตั้งค่า Domain (Optional แต่แนะนำ)

1. ไปที่ **Domains** ใน dashboard
2. คลิก **Add Domain**
3. ใส่ domain ของคุณ (เช่น: `your-domain.com`)
4. เพิ่ม DNS records ตามที่ Resend แนะนำ
5. รอให้ domain verified (อาจใช้เวลาสักครู่)

**หมายเหตุ**: ถ้ายังไม่มี domain สามารถใช้ `onboarding@resend.dev` สำหรับการทดสอบ

---

## ⚙️ การตั้งค่า Supabase Edge Function

### ขั้นตอนที่ 1: ติดตั้ง Supabase CLI

**⚠️ หมายเหตุ**: Supabase CLI ไม่สามารถติดตั้งด้วย `npm install -g` ได้แล้ว

**วิธีที่ 1: ใช้ Scoop (แนะนำสำหรับ Windows)**

```powershell
# ติดตั้ง Scoop (ถ้ายังไม่มี)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# ติดตั้ง Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**วิธีที่ 2: ใช้ Chocolatey**

```powershell
# ติดตั้ง Chocolatey (ถ้ายังไม่มี)
# เปิด PowerShell as Administrator แล้วรัน:
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# ติดตั้ง Supabase CLI
choco install supabase
```

**วิธีที่ 3: ดาวน์โหลด Binary โดยตรง**

1. ไปที่ [Supabase CLI Releases](https://github.com/supabase/cli/releases)
2. ดาวน์โหลด `supabase_windows_amd64.zip` (หรือ version ที่เหมาะสม)
3. แตกไฟล์และเพิ่ม path ไปยัง environment variables

**วิธีที่ 4: ใช้ npx (ไม่ต้องติดตั้ง)**

```bash
# ใช้ npx แทน (จะดาวน์โหลดทุกครั้งที่ใช้)
npx supabase@latest login
npx supabase@latest link --project-ref your-project-ref
```

**ตรวจสอบการติดตั้ง:**

```bash
supabase --version
```

### ขั้นตอนที่ 2: Login และ Link Project

```bash
# Login
supabase login

# Link project
supabase link --project-ref your-project-ref
```

หา project ref ได้ที่: **Supabase Dashboard > Settings > General > Reference ID**

### ขั้นตอนที่ 3: ตั้งค่า Environment Variables

```bash
# ตั้งค่า secrets สำหรับ Edge Function
supabase secrets set RESEND_API_KEY=your-resend-api-key
supabase secrets set RESEND_FROM_EMAIL=noreply@wongshare.com
supabase secrets set SITE_URL=https://wongshare-5ed5c.web.app/
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**หมายเหตุ**: 
- หา Service Role Key ได้ที่: **Supabase Dashboard > Settings > API > service_role key**
- อย่าเปิดเผย Service Role Key ให้ผู้อื่นเห็น!

หา Service Role Key ได้ที่: **Supabase Dashboard > Settings > API > service_role key**

### ขั้นตอนที่ 4: Deploy Edge Function

**⚠️ สำคัญ**: 
- ต้องรันคำสั่งจาก **root directory ของโปรเจกต์** (`vue_blog`)
- ต้องพิมพ์ `supabase@latest` ถูกต้อง (ไม่ใช่ `supabase@latetest`)

```powershell
# ไปที่ root directory ของโปรเจกต์
cd C:\Users\pangb\OneDrive\Documents\GitHub\vue_blog

# Deploy Edge Function
npx supabase@latest functions deploy send-email
```

**📖 ดูคู่มือ Quick Deploy**: [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

**หรือถ้าติดตั้ง Supabase CLI แล้ว:**

```powershell
cd C:\Users\pangb\OneDrive\Documents\GitHub\vue_blog
supabase functions deploy send-email
```

**📖 ดูคู่มือ Deploy Function แบบละเอียด**: [DEPLOY_FUNCTION.md](./DEPLOY_FUNCTION.md)

**ถ้าเจอ error "entrypoint path does not exist":**
- ตรวจสอบว่าอยู่ใน root directory ที่มีโฟลเดอร์ `supabase/functions/send-email/`
- ตรวจสอบว่าไฟล์ `supabase/config.toml` มีอยู่

---

## 📊 การรัน Migration

### วิธีที่ 1: ใช้ Supabase Dashboard (แนะนำ)

1. ไปที่ **Supabase Dashboard > SQL Editor**
2. คลิก **New query**
3. เปิดไฟล์ `supabase/migrations/002_email_subscriptions.sql`
4. คัดลอกเนื้อหาทั้งหมด
5. วางใน SQL Editor
6. คลิก **Run** หรือกด `Ctrl+Enter`

### วิธีที่ 2: ใช้ Supabase CLI

```bash
supabase db push
```

---

## 🧪 การทดสอบ

### 1. ทดสอบการตั้งค่าอีเมล

1. เปิดแอปและ login
2. ไปที่ `/settings/email`
3. ตรวจสอบการตั้งค่าต่างๆ
4. เปลี่ยนการตั้งค่าและบันทึก

### 2. ทดสอบการส่งอีเมล Subscription Update

1. ไปที่หน้า subscription management
2. อัปเกรด subscription หรือเปลี่ยนสถานะ
3. ตรวจสอบอีเมล inbox
4. ตรวจสอบ email logs ใน Supabase:
   ```sql
   SELECT * FROM email_logs 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

### 3. ทดสอบการส่งอีเมลบทความใหม่

1. สร้างบทความใหม่และ publish
2. ตรวจสอบอีเมล inbox ของ subscribers
3. ตรวจสอบ email logs

---

## 🐛 Troubleshooting

### ปัญหา: "RESEND_API_KEY is not set"

**สาเหตุ**: Environment variable ยังไม่ได้ตั้งค่า

**วิธีแก้**:
```bash
supabase secrets set RESEND_API_KEY=your-api-key
```

### ปัญหา: "Resend API error"

**สาเหตุ**: API key ไม่ถูกต้องหรือ domain ยังไม่ได้ verify

**วิธีแก้**:
1. ตรวจสอบ API key ใน Resend dashboard
2. ตรวจสอบว่า domain verified แล้ว (ถ้าใช้ custom domain)
3. ลองใช้ `onboarding@resend.dev` สำหรับการทดสอบ

### ปัญหา: อีเมลไม่ถูกส่ง

**สาเหตุ**: 
- Email subscription disabled
- Edge Function ไม่ได้ deploy
- Database trigger ไม่ทำงาน

**วิธีแก้**:
1. ตรวจสอบ email_subscriptions table:
   ```sql
   SELECT * FROM email_subscriptions WHERE user_id = 'your-user-id';
   ```
2. ตรวจสอบว่า `enabled = true` และ email type ที่ต้องการเปิดอยู่
3. ตรวจสอบ email_logs:
   ```sql
   SELECT * FROM email_logs 
   WHERE user_id = 'your-user-id' 
   ORDER BY created_at DESC;
   ```
4. ตรวจสอบ Edge Function logs:
   ```bash
   supabase functions logs send-email
   ```

### ปัญหา: อีเมลไปที่ spam

**วิธีแก้**:
1. ใช้ verified domain แทน `onboarding@resend.dev`
2. เพิ่ม SPF และ DKIM records
3. ใช้ email address ที่น่าเชื่อถือ
4. หลีกเลี่ยงการใช้คำที่ถูกตรวจจับเป็น spam

---

## 📧 Email Templates

ระบบจะส่งอีเมลในรูปแบบ HTML ที่สวยงาม:

### 1. Subscription Update Email
- แจ้งเมื่อมีการเปลี่ยนแปลงสถานะ subscription
- แสดงแผนและสถานะปัจจุบัน
- มีลิงก์ไปยังหน้า subscription

### 2. New Article Email
- แจ้งเมื่อมีบทความใหม่
- แสดงชื่อบทความและ excerpt
- มีลิงก์ไปยังบทความ

---

## 🔧 การปรับแต่ง Email Templates

คุณสามารถแก้ไข email templates ได้ใน:
- `supabase/migrations/002_email_subscriptions.sql` - ใน functions `notify_subscribers_new_article()` และ `notify_subscription_update()`

---

## 📊 Monitoring

### ดู Email Statistics

```sql
-- สถิติการส่งอีเมล
SELECT 
  email_type,
  status,
  COUNT(*) as count
FROM email_logs
GROUP BY email_type, status;

-- อีเมลที่ส่งล่าสุด
SELECT 
  email,
  email_type,
  subject,
  status,
  created_at
FROM email_logs
ORDER BY created_at DESC
LIMIT 20;
```

---

## ✅ Checklist

ก่อนใช้งานระบบส่งอีเมล ตรวจสอบว่า:

- [ ] สร้างบัญชี Resend แล้ว
- [ ] สร้าง API Key แล้ว
- [ ] ตั้งค่า domain (optional)
- [ ] ติดตั้ง Supabase CLI แล้ว
- [ ] Link project แล้ว
- [ ] ตั้งค่า environment variables แล้ว
- [ ] Deploy Edge Function แล้ว
- [ ] รัน migration แล้ว
- [ ] ทดสอบการส่งอีเมลสำเร็จแล้ว

---

## 📚 เอกสารเพิ่มเติม

- [Resend Documentation](https://resend.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)

---

**Happy Coding! 🎉**

