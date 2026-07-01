-- ============================================
-- Authors Table and CMS Policies Migration
-- Vue Blog Application
-- ============================================

-- ============================================
-- 1. AUTHORS TABLE
-- ============================================
-- สร้างตาราง authors แยกสำหรับจัดการผู้เขียน

CREATE TABLE IF NOT EXISTS public.authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  email TEXT,
  specialization TEXT,
  social_links JSONB DEFAULT '{}'::JSONB,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view enabled authors
CREATE POLICY "Everyone can view enabled authors"
  ON public.authors FOR SELECT
  USING (enabled = true);

-- Policy: Everyone can view all authors (for CMS)
CREATE POLICY "Everyone can view all authors"
  ON public.authors FOR SELECT
  USING (true);

-- Policy: Everyone can manage authors (for CMS)
CREATE POLICY "Everyone can manage authors"
  ON public.authors FOR ALL
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_authors_enabled ON public.authors(enabled);
CREATE INDEX IF NOT EXISTS idx_authors_name ON public.authors(name);

-- Function to update updated_at timestamp
CREATE TRIGGER update_authors_updated_at
  BEFORE UPDATE ON public.authors
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 2. UPDATE ARTICLES TABLE - Change author_id to reference authors
-- ============================================

-- 1. Set author_id to NULL for invalid references
UPDATE public.articles 
SET author_id = NULL 
WHERE author_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = articles.author_id);

-- 2. Drop existing foreign key constraint
ALTER TABLE public.articles 
DROP CONSTRAINT IF EXISTS articles_author_id_fkey;

-- 3. Add new foreign key constraint to reference authors table
ALTER TABLE public.articles 
ADD CONSTRAINT articles_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES public.authors(id) 
ON DELETE SET NULL;

-- ============================================
-- 3. DISABLE AUTHENTICATION REQUIREMENTS FOR CMS
-- ============================================

-- ============================================
-- 3.1 ARTICLES TABLE - Update RLS Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Published articles are viewable by everyone" ON public.articles;
DROP POLICY IF EXISTS "Authors can view own articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can insert own articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can update own articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can delete own articles" ON public.articles;

-- Create new policies that allow all operations without authentication
CREATE POLICY "Everyone can view all articles"
  ON public.articles FOR SELECT
  USING (true);

CREATE POLICY "Everyone can insert articles"
  ON public.articles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Everyone can update articles"
  ON public.articles FOR UPDATE
  USING (true);

CREATE POLICY "Everyone can delete articles"
  ON public.articles FOR DELETE
  USING (true);

-- ============================================
-- 3.2 CATEGORIES TABLE - Update RLS Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enabled categories are viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can view all categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.categories;

-- Create new policies
CREATE POLICY "Everyone can view all categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Everyone can manage categories"
  ON public.categories FOR ALL
  USING (true);

-- ============================================
-- 3.3 TAGS TABLE - Update RLS Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enabled tags are viewable by everyone" ON public.tags;
DROP POLICY IF EXISTS "Authenticated users can view all tags" ON public.tags;
DROP POLICY IF EXISTS "Authenticated users can manage tags" ON public.tags;

-- Create new policies
CREATE POLICY "Everyone can view all tags"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "Everyone can manage tags"
  ON public.tags FOR ALL
  USING (true);

-- ============================================
-- 3.4 ARTICLE_TAGS TABLE - Update RLS Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Article tags are viewable by everyone" ON public.article_tags;
DROP POLICY IF EXISTS "Authors can manage own article tags" ON public.article_tags;

-- Create new policies
CREATE POLICY "Everyone can view article tags"
  ON public.article_tags FOR SELECT
  USING (true);

CREATE POLICY "Everyone can manage article tags"
  ON public.article_tags FOR ALL
  USING (true);

