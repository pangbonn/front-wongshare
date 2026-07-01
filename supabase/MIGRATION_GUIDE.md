# 🔄 คู่มือ Migration จาก Google Apps Script ไป Supabase

คู่มือการย้ายข้อมูลจาก Google Apps Script + Google Sheets ไป Supabase Database

## 📊 สถานะปัจจุบัน

### ระบบปัจจุบัน (Google Apps Script)
- ✅ ใช้ Google Sheets เก็บข้อมูลบทความ
- ✅ Google Apps Script เป็น API backend
- ✅ ทำงานได้ปกติ

### ระบบใหม่ (Supabase)
- ✅ สร้าง database schema แล้ว
- ✅ มีตาราง: articles, profiles, favorites, subscriptions, notifications, email_subscriptions
- ❌ ยังไม่ได้เชื่อมต่อกับแอป
- ❌ ยังไม่ได้ migrate ข้อมูล

---

## 🎯 ตัวเลือกการใช้งาน

### ตัวเลือกที่ 1: ใช้ Supabase แทน Google Apps Script (แนะนำ)

**ข้อดี:**
- Real-time updates
- Authentication ที่ดีกว่า
- Performance ดีกว่า
- มี Row Level Security
- รองรับ subscriptions และ email notifications

**ข้อเสีย:**
- ต้อง migrate ข้อมูล
- ต้องแก้ไข code ในแอป

### ตัวเลือกที่ 2: ใช้ทั้งสองระบบร่วมกัน

**Google Apps Script:**
- เก็บข้อมูลบทความ (articles)
- API สำหรับอ่านบทความ

**Supabase:**
- Authentication (Google OAuth)
- User profiles
- Favorites
- Subscriptions
- Notifications
- Email subscriptions

**ข้อดี:**
- ไม่ต้อง migrate ข้อมูลทันที
- ใช้ Supabase สำหรับ features ใหม่

**ข้อเสีย:**
- ข้อมูลแยกกัน 2 ที่
- ต้อง maintain 2 ระบบ

### ตัวเลือกที่ 3: ใช้ Supabase เฉพาะ Features ใหม่

**Google Apps Script:**
- เก็บข้อมูลบทความ (articles) - ยังใช้ต่อ

**Supabase:**
- Authentication
- Favorites (เชื่อมกับ articles จาก Google Sheets)
- Subscriptions
- Notifications
- Email subscriptions

---

## 🚀 วิธี Migration (ตัวเลือกที่ 1)

### ขั้นตอนที่ 1: Export ข้อมูลจาก Google Sheets

```javascript
// เพิ่มฟังก์ชันนี้ใน Google Apps Script
function exportArticlesToJSON() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  
  const articles = data.slice(1).map((row, index) => ({
    id: row[0] || index + 1,
    title: row[2] || 'Untitled',
    slug: generateSlug(row[2] || 'untitled-' + index),
    content: row[4] || '',
    excerpt: row[3] || '',
    cover_image_url: row[8] || '',
    author: row[1] || 'Unknown',
    category: row[9] || 'General',
    tags: row[10] ? row[10].split(',').map(t => t.trim()) : [],
    published: row[11] === 'Published' || row[11] === true,
    published_at: row[13] || new Date().toISOString(),
    views_count: row[7] || 0,
    likes_count: row[6] || 0,
    created_at: row[13] || new Date().toISOString(),
    updated_at: row[14] || new Date().toISOString()
  }));
  
  return JSON.stringify(articles, null, 2);
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
```

### ขั้นตอนที่ 2: Import ข้อมูลไป Supabase

```sql
-- ใช้ SQL Editor ใน Supabase Dashboard
-- หรือใช้ Supabase Client ในแอป

-- ตัวอย่าง: Insert article
INSERT INTO public.articles (
  title, slug, content, excerpt, cover_image_url,
  published, published_at, views_count, likes_count
) VALUES (
  'Article Title',
  'article-slug',
  'Article content...',
  'Article excerpt...',
  'https://example.com/image.jpg',
  true,
  NOW(),
  0,
  0
);
```

### ขั้นตอนที่ 3: สร้าง Composable สำหรับ Articles

```typescript
// src/composables/useArticles.ts
import { ref } from 'vue'
import { supabase, type Article } from '../../supabase/config'

export function useArticles() {
  const articles = ref<Article[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchArticles = async (limit = 10, offset = 0) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (fetchError) throw fetchError
      articles.value = data || []
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching articles:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    articles,
    loading,
    error,
    fetchArticles
  }
}
```

### ขั้นตอนที่ 4: อัปเดต Views ให้ใช้ Supabase

```typescript
// src/views/Home.vue
import { useArticles } from '@/composables/useArticles'

const { articles, loading, fetchArticles } = useArticles()

onMounted(async () => {
  await fetchArticles()
})
```

---

## 🔗 วิธีเชื่อมต่อทั้งสองระบบ (ตัวเลือกที่ 2)

### สร้าง Bridge Function

```typescript
// src/composables/useArticleBridge.ts
import { ref } from 'vue'
import { supabase } from '../../supabase/config'

// ใช้ Google Apps Script สำหรับ articles
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'

// ใช้ Supabase สำหรับ user features
export function useArticleBridge() {
  // Fetch articles จาก Google Apps Script
  const fetchArticlesFromGoogle = async () => {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getArticles`)
    return await response.json()
  }

  // Save favorite ไป Supabase (เชื่อมกับ article_id จาก Google Sheets)
  const addFavoriteFromGoogleArticle = async (googleArticleId: number) => {
    const { user } = useAuth()
    if (!user.value) return

    // เก็บ reference ไปยัง Google Sheets article
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.value.id,
        article_id: `google-${googleArticleId}`, // ใช้ prefix เพื่อแยก
        metadata: { source: 'google_sheets', google_id: googleArticleId }
      })

    return { data, error }
  }

  return {
    fetchArticlesFromGoogle,
    addFavoriteFromGoogleArticle
  }
}
```

---

## 📋 Checklist สำหรับ Migration

### Phase 1: Setup Supabase
- [x] สร้าง Supabase project
- [x] รัน migrations (001_initial_schema.sql, 002_email_subscriptions.sql)
- [x] ตั้งค่า Google OAuth
- [x] Deploy Edge Function สำหรับส่งอีเมล

### Phase 2: Migrate Data (ถ้าเลือกตัวเลือกที่ 1)
- [ ] Export ข้อมูลจาก Google Sheets
- [ ] Transform ข้อมูลให้ตรงกับ Supabase schema
- [ ] Import ข้อมูลไป Supabase
- [ ] ตรวจสอบข้อมูล

### Phase 3: Update Application
- [ ] สร้าง composables สำหรับ Supabase
- [ ] อัปเดต views ให้ใช้ Supabase
- [ ] ทดสอบการทำงาน
- [ ] Deploy

### Phase 4: Features Integration
- [ ] เชื่อมต่อ Favorites กับ Articles
- [ ] เชื่อมต่อ Subscriptions
- [ ] เชื่อมต่อ Notifications
- [ ] เชื่อมต่อ Email Subscriptions

---

## 💡 คำแนะนำ

**สำหรับตอนนี้:**
- ใช้ Supabase สำหรับ Authentication, Favorites, Subscriptions, Notifications
- ใช้ Google Apps Script สำหรับ Articles (ยังใช้ต่อ)
- ค่อยๆ migrate Articles ไป Supabase ทีหลัง

**ในอนาคต:**
- Migrate Articles ทั้งหมดไป Supabase
- ใช้ Supabase เป็น single source of truth
- ปิด Google Apps Script (หรือใช้เป็น backup)

---

## 📚 เอกสารเพิ่มเติม

- [Supabase Migration Guide](https://supabase.com/docs/guides/migrations)
- [Supabase Client Documentation](https://supabase.com/docs/reference/javascript/introduction)

---

**Happy Migrating! 🎉**

