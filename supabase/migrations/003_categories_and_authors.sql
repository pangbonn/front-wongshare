-- ============================================
-- Categories and Authors Migration
-- Vue Blog Application
-- ============================================

-- ============================================
-- 1. CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  enabled BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view enabled categories
CREATE POLICY "Enabled categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (enabled = true);

-- Policy: Authenticated users can view all categories
CREATE POLICY "Authenticated users can view all categories"
  ON public.categories FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Only admins can insert/update/delete (adjust based on your needs)
-- For now, allow authenticated users to manage
CREATE POLICY "Authenticated users can manage categories"
  ON public.categories FOR ALL
  USING (auth.role() = 'authenticated');

-- Indexes for categories
CREATE INDEX IF NOT EXISTS idx_categories_enabled ON public.categories(enabled, sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- ============================================
-- 2. UPDATE PROFILES TABLE - Add Author Fields
-- ============================================
-- เพิ่มฟิลด์สำหรับ Author ใน profiles table

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_author BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS author_bio TEXT,
ADD COLUMN IF NOT EXISTS author_specialization TEXT,
ADD COLUMN IF NOT EXISTS author_social_links JSONB DEFAULT '{}'::JSONB,
ADD COLUMN IF NOT EXISTS author_verified BOOLEAN DEFAULT false;

-- Index for authors
CREATE INDEX IF NOT EXISTS idx_profiles_author ON public.profiles(is_author) WHERE is_author = true;

-- ============================================
-- 3. UPDATE ARTICLES TABLE - Add Category Reference
-- ============================================
-- เพิ่ม category_id ใน articles table

ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Index for category
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category_id);

-- ============================================
-- 4. FUNCTIONS
-- ============================================

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION public.generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to auto-generate slug for categories
CREATE OR REPLACE FUNCTION public.handle_category_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug
DROP TRIGGER IF EXISTS on_category_slug_generate ON public.categories;
CREATE TRIGGER on_category_slug_generate
  BEFORE INSERT OR UPDATE OF name ON public.categories
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION public.handle_category_slug();

-- Function to update updated_at timestamp
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 5. INSERT DEFAULT CATEGORIES
-- ============================================
INSERT INTO public.categories (name, slug, description, icon, color, enabled, sort_order)
VALUES
  ('เทคโนโลยี', 'technology', 'บทความเกี่ยวกับเทคโนโลยีและนวัตกรรม', 'technology', '#4285f4', true, 1),
  ('การออกแบบ', 'design', 'การออกแบบและ UX/UI', 'design', '#ea4335', true, 2),
  ('ธุรกิจ', 'business', 'ธุรกิจและการตลาด', 'business', '#34a853', true, 3),
  ('ไลฟ์สไตล์', 'lifestyle', 'ไลฟ์สไตล์และสุขภาพ', 'lifestyle', '#fbbc04', true, 4),
  ('การศึกษา', 'education', 'การศึกษาและการเรียนรู้', 'education', '#ff9800', true, 5),
  ('สุขภาพ', 'health', 'สุขภาพและการแพทย์', 'health', '#e91e63', true, 6),
  ('การท่องเที่ยว', 'travel', 'การท่องเที่ยว', 'travel', '#00bcd4', true, 7),
  ('อาหาร', 'food', 'อาหารและเครื่องดื่ม', 'food', '#ff5722', true, 8),
  ('กีฬา', 'sports', 'กีฬาและกิจกรรม', 'sports', '#4caf50', true, 9),
  ('บันเทิง', 'entertainment', 'บันเทิงและสื่อ', 'entertainment', '#9c27b0', true, 10)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 6. VIEWS
-- ============================================

-- View for articles with category details
CREATE OR REPLACE VIEW public.articles_with_category AS
SELECT 
  a.*,
  c.name as category_name,
  c.slug as category_slug,
  c.icon as category_icon,
  c.color as category_color,
  p.full_name as author_name,
  p.avatar_url as author_avatar,
  p.is_author as author_verified
FROM public.articles a
LEFT JOIN public.categories c ON a.category_id = c.id
LEFT JOIN public.profiles p ON a.author_id = p.id
WHERE a.published = true;

-- View for enabled categories with article count
CREATE OR REPLACE VIEW public.categories_with_count AS
SELECT 
  c.*,
  COUNT(a.id) FILTER (WHERE a.published = true) as article_count
FROM public.categories c
LEFT JOIN public.articles a ON c.id = a.category_id
WHERE c.enabled = true
GROUP BY c.id
ORDER BY c.sort_order, c.name;

