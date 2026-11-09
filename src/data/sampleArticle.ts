/**
 * Demo article for /article/demo — shows every content feature ArticleContent supports:
 * images with captions, highlighted code blocks, Mermaid diagrams, and callouts.
 * Use it as a template for writing real article HTML.
 */

export const SAMPLE_ARTICLE_ID = 'demo'

const content = `
<p>บทความนี้จะพาสร้างปุ่ม <strong>Favorite</strong> ให้บทความในบล็อก โดยใช้ <code>Vue 3</code> ฝั่งหน้าบ้าน
และ <code>Supabase</code> เป็นฐานข้อมูล พร้อม Row Level Security (RLS) เพื่อให้ผู้ใช้แต่ละคนเห็นเฉพาะรายการของตัวเอง</p>

<div data-callout="note">
  <p>บทความนี้เป็น <strong>หน้าตัวอย่าง</strong> สำหรับดูการแสดงผลรูปภาพ โค้ด diagram คำแนะนำ และคำเตือน
  สามารถใช้ HTML ในหน้านี้เป็นแม่แบบตอนเขียนบทความจริงได้</p>
</div>

<h2>ภาพรวมของระบบ</h2>

<p>เมื่อผู้ใช้กดปุ่มบันทึก หน้าเว็บจะเรียก composable <code>useFavorites()</code>
ซึ่งส่งคำสั่งไปยัง Supabase โดยตรง ไม่ต้องมี API server คั่นกลาง</p>

<figure>
  <img src="/demo/favorite-ui.svg" alt="ตัวอย่างปุ่มบันทึกบทความบนการ์ด" />
  <figcaption>รูปที่ 1 — ปุ่มบันทึกบนการ์ดบทความ (คลิกที่รูปเพื่อขยาย)</figcaption>
</figure>

<p>ลำดับการทำงานตั้งแต่กดปุ่มจนบันทึกลงฐานข้อมูลเป็นแบบนี้</p>

<pre data-title="ลำดับการทำงานเมื่อกดบันทึก"><code class="language-mermaid">sequenceDiagram
  actor U as ผู้ใช้
  participant V as Vue (useFavorites)
  participant S as Supabase
  participant DB as Postgres + RLS
  U->>V: กดปุ่มบันทึก
  V->>S: insert into favorites
  S->>DB: ตรวจ policy (auth.uid() = user_id)
  alt ผ่าน policy
    DB-->>S: บันทึกสำเร็จ
    S-->>V: { data }
    V-->>U: ไอคอนเปลี่ยนเป็น "บันทึกแล้ว"
  else ไม่ได้ login
    DB-->>S: permission denied
    S-->>V: { error }
    V-->>U: แจ้งให้เข้าสู่ระบบ
  end</code></pre>

<h2>1. สร้างตารางและ Policy</h2>

<p>เริ่มจากสร้างตาราง <code>favorites</code> ที่เก็บคู่ <code>user_id</code> กับ <code>article_id</code>
และกำหนดให้คู่นี้ห้ามซ้ำ</p>

<pre data-title="supabase/migrations/010_favorites.sql"><code class="language-sql">create table public.favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  article_id  uuid not null references public.articles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, article_id)
);

alter table public.favorites enable row level security;

create policy "อ่านได้เฉพาะของตัวเอง"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "เพิ่ม/ลบได้เฉพาะของตัวเอง"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);</code></pre>

<div data-callout="warning">
  <p>ถ้าลืม <code>enable row level security</code> ทุกคนที่มี anon key จะอ่านและแก้ไข favorites
  ของผู้ใช้คนอื่นได้ทั้งหมด ให้ตรวจใน Supabase Dashboard → Table Editor ว่าตารางขึ้นป้าย <strong>RLS enabled</strong> ทุกครั้ง</p>
</div>

<p>ความสัมพันธ์ของตารางที่เกี่ยวข้อง</p>

<pre data-title="ER diagram"><code class="language-mermaid">erDiagram
  PROFILES ||--o{ FAVORITES : "บันทึก"
  ARTICLES ||--o{ FAVORITES : "ถูกบันทึก"
  PROFILES {
    uuid id PK
    text full_name
  }
  ARTICLES {
    uuid id PK
    text title
    text slug
  }
  FAVORITES {
    uuid id PK
    uuid user_id FK
    uuid article_id FK
  }</code></pre>

<h2>2. เขียน Composable</h2>

<p>เก็บ state ไว้ระดับ module เพื่อให้ทุกคอมโพเนนต์เห็นข้อมูลชุดเดียวกัน</p>

<pre data-title="src/composables/useFavorites.ts"><code class="language-typescript">import { ref, computed } from 'vue'
import { supabase } from '../../supabase/config'

const favoriteIds = ref&lt;Set&lt;string&gt;&gt;(new Set())

export function useFavorites() {
  const toggleFavorite = async (articleId: string) =&gt; {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'ต้องเข้าสู่ระบบก่อน' }

    const isSaved = favoriteIds.value.has(articleId)
    const { error } = isSaved
      ? await supabase.from('favorites').delete()
          .eq('user_id', user.id).eq('article_id', articleId)
      : await supabase.from('favorites')
          .insert({ user_id: user.id, article_id: articleId })

    if (error) return { success: false, error: error.message }

    isSaved ? favoriteIds.value.delete(articleId) : favoriteIds.value.add(articleId)
    return { success: true }
  }

  return { favoriteIds: computed(() =&gt; favoriteIds.value), toggleFavorite }
}</code></pre>

<div data-callout="tip" data-title="ทำให้ปุ่มตอบสนองทันที">
  <p>เปลี่ยนไอคอนก่อน แล้วค่อยรอผลจาก Supabase (optimistic update) ผู้ใช้จะรู้สึกว่าแอปเร็วขึ้นมาก
  ถ้า request ล้มเหลวค่อยย้อนสถานะกลับและแสดงข้อความแจ้ง</p>
</div>

<h2>3. ใช้งานในคอมโพเนนต์</h2>

<pre data-title="ArticleCard.vue"><code class="language-html">&lt;template&gt;
  &lt;button class="btn btn-sm" @click="toggleFavorite(article.id)"&gt;
    {{ favoriteIds.has(article.id) ? 'บันทึกแล้ว' : 'บันทึก' }}
  &lt;/button&gt;
&lt;/template&gt;</code></pre>

<p>ทดสอบบนเครื่องด้วยคำสั่ง</p>

<pre><code class="language-bash">npm run dev
# เปิด http://localhost:5173 แล้ว login ด้วย Google</code></pre>

<blockquote>
  <p>[!CAUTION]
  ห้ามใส่ <code>service_role</code> key ในไฟล์ <code>.env</code> ของฝั่ง frontend เด็ดขาด
  เพราะ key นี้ข้าม RLS ได้ทั้งหมด และตัวแปรที่ขึ้นต้นด้วย <code>VITE_</code> จะถูก bundle ไปให้ทุกคนเห็น</p>
</blockquote>

<h2>สรุป</h2>

<table>
  <thead>
    <tr><th>ส่วน</th><th>หน้าที่</th><th>ไฟล์</th></tr>
  </thead>
  <tbody>
    <tr><td>Database</td><td>เก็บข้อมูล + บังคับสิทธิ์ด้วย RLS</td><td><code>010_favorites.sql</code></td></tr>
    <tr><td>Composable</td><td>เรียก Supabase และเก็บ state</td><td><code>useFavorites.ts</code></td></tr>
    <tr><td>UI</td><td>แสดงปุ่มและสถานะ</td><td><code>ArticleCard.vue</code></td></tr>
  </tbody>
</table>

<ul>
  <li>ใช้ <code>unique (user_id, article_id)</code> กันข้อมูลซ้ำ</li>
  <li>เปิด RLS ทุกตารางที่มีข้อมูลของผู้ใช้</li>
  <li>ใช้ anon key ฝั่ง frontend เท่านั้น</li>
</ul>
`

export const sampleArticle = {
  id: SAMPLE_ARTICLE_ID,
  author: 'ทีม WongShare',
  authorAvatar: null,
  title: 'สร้างระบบ Favorite ด้วย Vue 3 + Supabase แบบปลอดภัยด้วย RLS',
  summary: 'ตัวอย่างครบวงจรตั้งแต่ออกแบบตาราง เขียน policy ไปจนถึง composable และปุ่มบน UI พร้อม diagram อธิบายการทำงาน',
  content,
  date: '8 ต.ค. 2569',
  likesCount: 128,
  viewsCount: 2450,
  readingTime: 6,
  image: '/demo/cover.svg',
  category: 'Tutorial',
  categorySlug: 'tutorial',
  categoryColor: '#2563eb',
  tags: [
    { name: 'Vue 3', slug: 'vue' },
    { name: 'Supabase', slug: 'supabase' },
    { name: 'TypeScript', slug: 'typescript' },
    { name: 'RLS', slug: 'rls' },
  ],
}
