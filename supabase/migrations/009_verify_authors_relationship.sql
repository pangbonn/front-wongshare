-- ============================================
-- Verify Authors Relationship
-- Vue Blog Application
-- ============================================
-- Migration เพื่อตรวจสอบและแก้ไข foreign key relationship ระหว่าง articles และ authors

-- ============================================
-- 1. Verify and Fix Foreign Key Constraint
-- ============================================

-- Drop existing foreign key constraint if it references profiles
DO $$
DECLARE
  constraint_name_var TEXT;
  referenced_table TEXT;
BEGIN
  -- Find foreign key constraint on author_id
  FOR constraint_name_var IN
    SELECT tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'articles'
      AND tc.table_schema = 'public'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'author_id'
  LOOP
    -- Get referenced table
    SELECT ccu.table_name INTO referenced_table
    FROM information_schema.constraint_column_usage ccu
    WHERE ccu.constraint_name = constraint_name_var
      AND ccu.table_schema = 'public';
    
    -- If it references profiles instead of authors, drop it
    IF referenced_table = 'profiles' THEN
      EXECUTE format('ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS %I', constraint_name_var);
    END IF;
  END LOOP;
END $$;

-- Add foreign key constraint to reference authors table
-- Only if authors table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'authors' 
    AND table_schema = 'public'
  ) THEN
    -- Check if constraint already exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_name = 'articles'
      AND table_schema = 'public'
      AND constraint_name = 'articles_author_id_fkey'
      AND constraint_type = 'FOREIGN KEY'
    ) THEN
      ALTER TABLE public.articles
      ADD CONSTRAINT articles_author_id_fkey
      FOREIGN KEY (author_id) 
      REFERENCES public.authors(id) 
      ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- ============================================
-- 2. Create Sample Authors (if needed)
-- ============================================
-- สร้าง author ตัวอย่างถ้ายังไม่มี

-- Insert sample authors
INSERT INTO public.authors (name, avatar_url, bio, specialization, enabled)
VALUES
  ('Wong Share', 'https://res.cloudinary.com/dkxpnkf7a/image/upload/v1760340617/Screenshot_2025-10-13_142718_eo7pyv.png', 'Tech Blogger', 'Web Development, Vue.js', true),
  ('Admin', NULL, 'System Administrator', 'General', true)
ON CONFLICT (name) DO UPDATE SET enabled = true;

-- ============================================
-- 3. Update Articles with Sample Author (if author_id is NULL)
-- ============================================
-- อัปเดต articles ที่ไม่มี author_id ให้ใช้ author ตัวอย่าง

UPDATE public.articles
SET author_id = (
  SELECT id FROM public.authors 
  WHERE name = 'Wong Share' 
  LIMIT 1
)
WHERE author_id IS NULL
  AND EXISTS (SELECT 1 FROM public.authors WHERE name = 'Wong Share');

