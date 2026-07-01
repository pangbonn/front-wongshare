# 🪟 คู่มือติดตั้ง Supabase CLI บน Windows

คู่มือการติดตั้ง Supabase CLI บน Windows อย่างละเอียด

## ⚠️ ปัญหาที่พบบ่อย

**Error**: `Installing Supabase CLI as a global module is not supported`

**สาเหตุ**: Supabase CLI ไม่รองรับการติดตั้งด้วย `npm install -g` แล้ว

---

## ✅ วิธีติดตั้งที่แนะนำ

### วิธีที่ 1: ใช้ Scoop (แนะนำที่สุด) ⭐

Scoop เป็น package manager สำหรับ Windows ที่ใช้งานง่าย

#### ขั้นตอนที่ 1: ติดตั้ง Scoop

เปิด PowerShell แล้วรัน:

```powershell
# อนุญาตให้รัน script
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# ติดตั้ง Scoop
irm get.scoop.sh | iex
```

#### ขั้นตอนที่ 2: เพิ่ม Supabase Bucket

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
```

#### ขั้นตอนที่ 3: ติดตั้ง Supabase CLI

```powershell
scoop install supabase
```

#### ขั้นตอนที่ 4: ตรวจสอบการติดตั้ง

```powershell
supabase --version
```

---

### วิธีที่ 2: ใช้ Chocolatey

Chocolatey เป็น package manager อีกตัวสำหรับ Windows

#### ขั้นตอนที่ 1: ติดตั้ง Chocolatey

เปิด PowerShell **as Administrator** แล้วรัน:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

#### ขั้นตอนที่ 2: ติดตั้ง Supabase CLI

```powershell
choco install supabase
```

#### ขั้นตอนที่ 3: ตรวจสอบการติดตั้ง

```powershell
supabase --version
```

---

### วิธีที่ 3: ดาวน์โหลด Binary โดยตรง

เหมาะสำหรับผู้ที่ไม่ต้องการใช้ package manager

#### ขั้นตอนที่ 1: ดาวน์โหลด

1. ไปที่ [Supabase CLI Releases](https://github.com/supabase/cli/releases)
2. หา release ล่าสุด
3. ดาวน์โหลด `supabase_windows_amd64.zip` (สำหรับ 64-bit)
   - หรือ `supabase_windows_arm64.zip` (สำหรับ ARM)

#### ขั้นตอนที่ 2: แตกไฟล์

1. แตกไฟล์ ZIP
2. คัดลอกไฟล์ `supabase.exe` ไปยังโฟลเดอร์ที่ต้องการ (เช่น `C:\tools\supabase\`)

#### ขั้นตอนที่ 3: เพิ่มไปยัง PATH

1. ค้นหา "Environment Variables" ใน Windows Search
2. คลิก "Edit the system environment variables"
3. คลิก "Environment Variables..."
4. ใน "System variables" หา "Path" แล้วคลิก "Edit"
5. คลิก "New" และเพิ่ม path ที่เก็บ `supabase.exe` (เช่น `C:\tools\supabase`)
6. คลิก "OK" ทั้งหมด
7. **รีสตาร์ท PowerShell หรือ Command Prompt**

#### ขั้นตอนที่ 4: ตรวจสอบการติดตั้ง

```powershell
supabase --version
```

---

### วิธีที่ 4: ใช้ npx (ไม่ต้องติดตั้ง)

เหมาะสำหรับการทดสอบหรือใช้งานครั้งเดียว

```bash
# Login
npx supabase@latest login

# Link project
npx supabase@latest link --project-ref your-project-ref

# Deploy function
npx supabase@latest functions deploy send-email
```

**ข้อเสีย**: จะดาวน์โหลดทุกครั้งที่ใช้ (ช้ากว่า)

---

## 🔧 การใช้งาน Supabase CLI

### Login

```bash
supabase login
```

จะเปิดเบราว์เซอร์ให้ login และ authorize

### Link Project

```bash
supabase link --project-ref your-project-ref
```

หา project ref ได้ที่: **Supabase Dashboard > Settings > General > Reference ID**

### Deploy Edge Function

```bash
supabase functions deploy send-email
```

### ตั้งค่า Secrets

```bash
supabase secrets set RESEND_API_KEY=your-api-key
supabase secrets set RESEND_FROM_EMAIL=noreply@your-domain.com
supabase secrets set SITE_URL=https://your-domain.com
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### ดู Logs

```bash
supabase functions logs send-email
```

---

## 🐛 Troubleshooting

### ปัญหา: "supabase: command not found"

**สาเหตุ**: PATH ไม่ถูกต้องหรือยังไม่ได้รีสตาร์ท terminal

**วิธีแก้**:
1. ตรวจสอบว่า `supabase.exe` อยู่ใน PATH
2. รีสตาร์ท PowerShell หรือ Command Prompt
3. ลองใช้ full path: `C:\tools\supabase\supabase.exe --version`

### ปัญหา: "Execution Policy" error

**สาเหตุ**: PowerShell execution policy ไม่อนุญาตให้รัน script

**วิธีแก้**:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### ปัญหา: Scoop installation failed

**วิธีแก้**:
1. ตรวจสอบว่า PowerShell version >= 5.1
2. รัน PowerShell as Administrator
3. ลองติดตั้งใหม่:
   ```powershell
   Remove-Item -Recurse -Force ~\scoop
   irm get.scoop.sh | iex
   ```

---

## 📚 เอกสารเพิ่มเติม

- [Supabase CLI GitHub](https://github.com/supabase/cli)
- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Scoop Documentation](https://scoop.sh/)
- [Chocolatey Documentation](https://chocolatey.org/docs)

---

**Happy Coding! 🎉**

