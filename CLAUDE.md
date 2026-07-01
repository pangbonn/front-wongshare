# WongShare Vue Blog — CLAUDE.md

> คู่มือนี้ใช้สำหรับ Claude agent เพื่อเข้าใจโปรเจคและพัฒนาต่อได้ทันที

## ภาพรวมโปรเจค

**ชื่อ:** WongShare — Thai-language blog PWA  
**Stack:** Vue 3 + TypeScript + Supabase + Tailwind CSS + DaisyUI  
**Deploy:** Firebase Hosting  
**Supabase project:** `kqvnouuzhuxjmnanvpqw` (URL: `https://kqvnouuzhuxjmnanvpqw.supabase.co`)

### สิ่งที่แอปทำ
Blog platform ภาษาไทย รองรับ:
- อ่านบทความ (categories, tags, search)
- Login ด้วย Google OAuth
- Favorite บทความ (ต้อง login)
- ตั้งค่า email subscription
- แสดงผลเป็น PWA บน mobile

---

## Tech Stack รายละเอียด

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Vue.js 3 (Composition API) | ^3.5.21 |
| Language | TypeScript | ~5.8.3 |
| Build | Vite | ^7.1.7 |
| Styling | Tailwind CSS + DaisyUI | 3.4 + 5.1 |
| Icons | Lucide Vue Next | ^0.562.0 |
| Syntax highlight | Highlight.js | ^11.11.1 |
| Backend | Supabase JS | ^2.90.1 |
| Deploy | Firebase Hosting | ^12.3.0 |
| PWA | vite-plugin-pwa + Workbox | ^1.0.3 |
| Font | Sarabun (Thai-friendly) | Google Fonts |

---

## โครงสร้างไฟล์

```
vue_blog/
├── src/
│   ├── composables/          # Business logic (ทุก feature แยกไฟล์)
│   │   ├── useAuth.ts        # Google OAuth, session, profile
│   │   ├── useArticles.ts    # CRUD articles, filter, search
│   │   ├── useCategories.ts  # Category management
│   │   ├── useTags.ts        # Tag management, many-to-many
│   │   ├── useFavorites.ts   # Add/remove favorites
│   │   ├── useSubscriptions.ts  # Subscription plans (free/premium/pro)
│   │   ├── useNotifications.ts  # Real-time notifications
│   │   ├── useEmailSubscriptions.ts  # Email preference settings
│   │   └── useCache.ts       # LocalStorage cache for offline
│   ├── components/
│   │   ├── Header.vue        # Navigation bar (back button, logo)
│   │   ├── Icon.vue          # Lucide icon wrapper
│   │   ├── GoogleAuthButton.vue  # Google login button
│   │   └── EmailPreferences.vue  # Email settings form
│   ├── views/
│   │   ├── Home.vue          # Article listing + filter
│   │   ├── ArticleDetail.vue # Article reader (syntax highlight)
│   │   ├── EmailSettings.vue # Email subscription settings page
│   │   ├── AuthExample.vue   # Auth demo (dev only)
│   │   └── HomeSupabase.vue  # Migration test page (dev only)
│   ├── router/
│   │   ├── index.ts          # Routes definition
│   │   └── auth-callback.ts  # OAuth callback handler
│   ├── App.vue               # Root component
│   ├── main.ts               # App entry (initAuth + mount)
│   └── style.css             # Global styles (Tailwind base + custom)
├── supabase/
│   ├── config.ts             # Supabase client + TypeScript interfaces
│   ├── config.toml           # Supabase project config
│   ├── migrations/           # SQL migrations (001–009)
│   └── functions/
│       └── send-email/       # Deno Edge Function (email sending)
├── .env                      # Environment variables (gitignored)
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.app.json
├── firebase.json             # Firebase hosting config
└── package.json
```

---

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Home.vue | หน้าหลัก — รายการบทความ |
| `/article/:id` | ArticleDetail.vue | อ่านบทความ (รับ slug หรือ UUID) |
| `/settings/email` | EmailSettings.vue | ตั้งค่า email (ต้อง login) |
| `/auth/callback` | (Home + beforeEnter guard) | Google OAuth callback |

---

## Composables API

### `useAuth()`
```ts
{ user, profile, session, loading, isAuthenticated, isPremium, isAuthor,
  initAuth, signInWithGoogle, signOut, updateProfile, updateAuthorProfile, fetchProfile }
```
- State เป็น module-level (shared across components)
- `initAuth()` ต้องเรียกใน `main.ts` ก่อน mount
- `isPremium` ยังเป็น placeholder (ต้องต่อ subscriptions table)

### `useArticles()`
```ts
{ articles, currentArticle, loading, error,
  fetchArticles, fetchArticleBySlug, fetchArticleById,
  createArticle, updateArticle, deleteArticle,
  incrementViewCount, fetchRelatedArticles }
```
- `fetchArticles({ category?, tag?, limit?, published? })` — filter support
- View count เพิ่มอัตโนมัติเมื่อเปิดบทความ

### `useCategories()`
```ts
{ categories, loading, error,
  fetchCategories, fetchCategoryBySlug, fetchCategoryById,
  createCategory, updateCategory, deleteCategory, toggleCategoryEnabled }
```

### `useTags()`
```ts
{ tags, loading, error,
  fetchTags, fetchTagBySlug, getArticleTags,
  createTag, updateTag, deleteTag, addTagToArticle, removeTagFromArticle }
```

### `useFavorites()`
```ts
{ favorites, loading,
  fetchFavorites, addFavorite, removeFavorite, isFavorited, toggleFavorite }
```
- ต้อง login ก่อน ไม่งั้น error

### `useEmailSubscriptions()`
```ts
{ emailSubscription, loading,
  fetchEmailSubscription, upsertEmailSubscription, updateEmailPreferences,
  toggleEmailEnabled, unsubscribeAll }
```

### `useSubscriptions()`
```ts
{ subscription, loading,
  fetchSubscription, createSubscription, updateSubscription, cancelSubscription,
  isActive, isPremium, isPro }
```
- Table มีแล้ว แต่ยังไม่มี payment integration

### `useNotifications()`
```ts
{ notifications, unreadCount, loading,
  fetchNotifications, markAsRead, markAllAsRead, deleteNotification,
  subscribeToNotifications, unsubscribeFromNotifications }
```
- ใช้ Supabase realtime channels

---

## Database Schema

### Tables

| Table | Key Fields | Notes |
|-------|-----------|-------|
| `profiles` | id, email, full_name, avatar_url, is_author | FK to auth.users |
| `articles` | id, title, slug, content, author_id, category_id, published | slug unique |
| `categories` | id, name, slug, icon, color, enabled, sort_order | |
| `tags` | id, name, slug, color, icon, enabled, usage_count | |
| `article_tags` | article_id, tag_id | junction table |
| `favorites` | user_id, article_id | unique pair |
| `subscriptions` | user_id, subscription_type, status | free/premium/pro |
| `notifications` | user_id, type, title, message, read | |
| `email_subscriptions` | user_id, email, 4 toggles, enabled | |
| `email_logs` | user_id, email_type, status | sent/failed/bounced |

### Views
- `user_favorites_view` — favorites joined with article details
- `user_notifications_count` — unread count per user

### Triggers
- `on_auth_user_created` → สร้าง profile อัตโนมัติ
- `on_profile_created_subscription` → สร้าง free subscription
- `handle_updated_at` triggers บน profiles, articles, subscriptions

### Functions
- `increment_views(article_id)` — atomic view count increment
- `handle_new_user()` — profile creation trigger
- `create_default_subscription()` — subscription trigger

---

## TypeScript Interfaces (supabase/config.ts)

```ts
Profile, Article, Category, Tag, ArticleTag, Favorite,
Subscription, Notification, EmailSubscription, EmailLog,
UserFavoriteView, ArticleWithTags, Author
```

---

## Environment Variables

ไฟล์ `.env` (gitignored):
```env
VITE_SUPABASE_URL=https://kqvnouuzhuxjmnanvpqw.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

ดูตัวอย่างได้จาก `env.example.txt`

---

## Scripts

```bash
npm run dev        # dev server (localhost:5173)
npm run build      # vue-tsc + vite build → dist/
npm run preview    # preview dist/ locally
npm run deploy     # build + firebase deploy --only hosting
npm run deploy:all # build + firebase deploy (all services)
npm run serve      # firebase serve locally
```

---

## สิ่งที่ยังขาด / ต้องพัฒนาต่อ

### Priority สูง (ต้องทำก่อน production)
- [ ] **Admin panel** — จัดการ articles, categories, tags (ยังไม่มีเลย)
- [ ] **User profile page** — `/profile` แสดง/แก้ไขข้อมูลส่วนตัว
- [ ] **Like button** — `likes_count` มีในฐานข้อมูลแล้ว แต่ยังไม่มี UI toggle
- [ ] **Search** — filter ใน useArticles มีแล้ว แต่ UI search bar ยังไม่ครบ

### Priority กลาง
- [ ] **Notification UI** — composable พร้อมแล้ว แต่ยังไม่มี notification bell/list ใน Header
- [ ] **Favorites page** — `/favorites` รายการที่ bookmark ไว้ (`user_favorites_view` มีแล้ว)
- [ ] **Author profile page** — `/author/:id` (is_author fields พร้อมแล้ว)
- [ ] **PWA auto-update** — code ถูก comment ไว้ใน main.ts รอ enable

### Priority ต่ำ (future)
- [ ] **Subscription payments** — Stripe integration (table + composable พร้อมแล้ว)
- [ ] **Comments system** — ยังไม่มี table
- [ ] **Email sending** — Edge Function มีแล้ว แต่ต้องตั้งค่า SMTP provider

---

## Pattern การเขียนโค้ด

### Composable pattern
```ts
// State เป็น module-level เพื่อ share ข้าม components
const state = ref(null)

export function useXxx() {
  const fetch = async () => { /* supabase query */ }
  return { state: computed(() => state.value), fetch }
}
```

### Supabase query pattern
```ts
const { data, error } = await supabase
  .from('table')
  .select('*, relation(*)')
  .eq('column', value)
  .order('created_at', { ascending: false })
```

### Component ใช้ composable
```ts
const { articles, loading, fetchArticles } = useArticles()
onMounted(() => fetchArticles({ category: 'tech' }))
```

### การ guard route (login required)
```ts
// ใน component
const { isAuthenticated } = useAuth()
if (!isAuthenticated.value) router.push('/')
```

---

## สถาปัตยกรรมและข้อควรระวัง

1. **Module-level state** ใน composables — state shared globally ไม่ต้อง provide/inject
2. **RLS enforced** ทุก table — Supabase policies บังคับ server-side
3. **Slug vs UUID** — `ArticleDetail` รับได้ทั้งสอง (ลอง fetchBySlug ก่อน fallback fetchById)
4. **Tailwind v3 + DaisyUI v5** — ใช้ `@apply` directive และ DaisyUI component class ได้
5. **PWA** — vite-plugin-pwa configured แต่ registerSW ถูก comment ไว้ใน main.ts
6. **Firebase** dependency ถูก import แต่ใช้แค่ Hosting deploy (ไม่ใช้ Firestore/Auth)
