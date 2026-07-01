-- ============================================
-- Lock down CMS RLS (revert 008 permissive policies)
-- ============================================
-- Migration 008 เปิด policies แบบ USING (true) เพื่อความสะดวก CMS
-- ทำให้ผู้ใช้ที่ไม่มีสิทธิ์ (แม้ไม่ล็อกอิน) แก้ไขข้อมูลผ่าน anon key ได้
-- นโยบายใหม่: อ่านสาธารณะตามเดิม, แก้ไขได้เฉพาะ profiles.is_author = true

-- ========== ARTICLES ==========
DROP POLICY IF EXISTS "Everyone can view all articles" ON public.articles;
DROP POLICY IF EXISTS "Everyone can insert articles" ON public.articles;
DROP POLICY IF EXISTS "Everyone can update articles" ON public.articles;
DROP POLICY IF EXISTS "Everyone can delete articles" ON public.articles;

CREATE POLICY "Published articles are viewable by everyone"
  ON public.articles FOR SELECT
  USING (published = true);

CREATE POLICY "Authors can view all articles"
  ON public.articles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  );

CREATE POLICY "Authors can insert articles"
  ON public.articles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  );

CREATE POLICY "Authors can update articles"
  ON public.articles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  );

CREATE POLICY "Authors can delete articles"
  ON public.articles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  );

-- ========== CATEGORIES ==========
DROP POLICY IF EXISTS "Everyone can view all categories" ON public.categories;
DROP POLICY IF EXISTS "Everyone can manage categories" ON public.categories;

CREATE POLICY "Enabled categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (enabled = true);

CREATE POLICY "Authors can view all categories"
  ON public.categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  );

CREATE POLICY "Authors can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  );

CREATE POLICY "Authors can update categories"
  ON public.categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  );

CREATE POLICY "Authors can delete categories"
  ON public.categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  );

-- ========== TAGS ==========
DROP POLICY IF EXISTS "Everyone can view all tags" ON public.tags;
DROP POLICY IF EXISTS "Everyone can manage tags" ON public.tags;

CREATE POLICY "Enabled tags are viewable by everyone"
  ON public.tags FOR SELECT
  USING (enabled = true);

CREATE POLICY "Authors can view all tags"
  ON public.tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  );

CREATE POLICY "Authors can insert tags"
  ON public.tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  );

CREATE POLICY "Authors can update tags"
  ON public.tags FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  );

CREATE POLICY "Authors can delete tags"
  ON public.tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  );

-- ========== ARTICLE_TAGS ==========
DROP POLICY IF EXISTS "Everyone can view article tags" ON public.article_tags;
DROP POLICY IF EXISTS "Everyone can manage article tags" ON public.article_tags;

CREATE POLICY "Article tags viewable when article published"
  ON public.article_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.id = article_tags.article_id AND a.published IS TRUE
    )
  );

CREATE POLICY "Authors can view all article tags"
  ON public.article_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  );

CREATE POLICY "Authors can insert article tags"
  ON public.article_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  );

CREATE POLICY "Authors can update article tags"
  ON public.article_tags FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  );

CREATE POLICY "Authors can delete article tags"
  ON public.article_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  );

-- ========== AUTHORS (CMS directory) ==========
DROP POLICY IF EXISTS "Everyone can view enabled authors" ON public.authors;
DROP POLICY IF EXISTS "Everyone can view all authors" ON public.authors;
DROP POLICY IF EXISTS "Everyone can manage authors" ON public.authors;

CREATE POLICY "Enabled authors are viewable by everyone"
  ON public.authors FOR SELECT
  USING (enabled = true);

CREATE POLICY "Authors can view all author records"
  ON public.authors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  );

CREATE POLICY "Authors can insert author records"
  ON public.authors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  );

CREATE POLICY "Authors can update author records"
  ON public.authors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  );

CREATE POLICY "Authors can delete author records"
  ON public.authors FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_author IS TRUE
    )
  );
