-- ============================================
-- Fix Articles Foreign Key Constraint
-- Vue Blog Application
-- ============================================

-- ============================================
-- 1. Remove author_profile_id Column (if exists)
-- ============================================
-- ลบ author_profile_id column ที่ไม่ใช้แล้ว
-- เพราะเราใช้ author_id แทน

-- 1. Drop foreign key constraint for author_profile_id
ALTER TABLE public.articles 
DROP CONSTRAINT IF EXISTS articles_author_profile_id_fkey;

-- 2. Drop index for author_profile_id
DROP INDEX IF EXISTS idx_articles_author_profile;

-- 3. Drop author_profile_id column
ALTER TABLE public.articles 
DROP COLUMN IF EXISTS author_profile_id;

-- ============================================
-- 2. Fix author_id Foreign Key Constraint
-- ============================================

-- Drop existing foreign key constraints on author_id (if any)
DO $$ 
DECLARE
  constraint_name_var TEXT;
BEGIN
  -- Find and drop any existing foreign key constraint on author_id
  FOR constraint_name_var IN
    SELECT constraint_name
    FROM information_schema.table_constraints
    WHERE table_name = 'articles'
    AND table_schema = 'public'
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name IN (
      SELECT constraint_name
      FROM information_schema.key_column_usage
      WHERE table_name = 'articles'
      AND table_schema = 'public'
      AND column_name = 'author_id'
    )
  LOOP
    EXECUTE format('ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS %I', constraint_name_var);
  END LOOP;
END $$;

-- Add named foreign key constraint for author_id
-- Note: This will be updated in migration 008 to reference authors table
-- For now, check if authors table exists first
DO $$
BEGIN
  -- Check if authors table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'authors' AND table_schema = 'public') THEN
    -- If authors table exists, reference authors
    ALTER TABLE public.articles
    ADD CONSTRAINT articles_author_id_fkey
    FOREIGN KEY (author_id) 
    REFERENCES public.authors(id) 
    ON DELETE SET NULL;
  ELSE
    -- If authors table doesn't exist yet, reference profiles (will be updated in migration 008)
    ALTER TABLE public.articles
    ADD CONSTRAINT articles_author_id_fkey
    FOREIGN KEY (author_id) 
    REFERENCES public.profiles(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

