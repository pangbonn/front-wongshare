-- ============================================
-- Tags Migration
-- Vue Blog Application
-- ============================================

-- ============================================
-- 1. TAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  enabled BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view enabled tags
CREATE POLICY "Enabled tags are viewable by everyone"
  ON public.tags FOR SELECT
  USING (enabled = true);

-- Policy: Authenticated users can view all tags
CREATE POLICY "Authenticated users can view all tags"
  ON public.tags FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can manage tags
CREATE POLICY "Authenticated users can manage tags"
  ON public.tags FOR ALL
  USING (auth.role() = 'authenticated');

-- Indexes for tags
CREATE INDEX IF NOT EXISTS idx_tags_enabled ON public.tags(enabled);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_usage ON public.tags(usage_count DESC);

-- ============================================
-- 2. ARTICLE_TAGS TABLE (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS public.article_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(article_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view article tags
CREATE POLICY "Article tags are viewable by everyone"
  ON public.article_tags FOR SELECT
  USING (true);

-- Policy: Authors can manage article tags for their articles
CREATE POLICY "Authors can manage own article tags"
  ON public.article_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.id = article_tags.article_id
      AND a.author_id = auth.uid()
    )
  );

-- Indexes for article_tags
CREATE INDEX IF NOT EXISTS idx_article_tags_article ON public.article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag ON public.article_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_unique ON public.article_tags(article_id, tag_id);

-- ============================================
-- 3. FUNCTIONS
-- ============================================

-- Function to auto-generate slug for tags
CREATE OR REPLACE FUNCTION public.handle_tag_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug
DROP TRIGGER IF EXISTS on_tag_slug_generate ON public.tags;
CREATE TRIGGER on_tag_slug_generate
  BEFORE INSERT OR UPDATE OF name ON public.tags
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION public.handle_tag_slug();

-- Function to update tag usage count
CREATE OR REPLACE FUNCTION public.update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increase usage count
    UPDATE public.tags
    SET usage_count = usage_count + 1
    WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrease usage count
    UPDATE public.tags
    SET usage_count = GREATEST(usage_count - 1, 0)
    WHERE id = OLD.tag_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update usage count
DROP TRIGGER IF EXISTS on_article_tag_usage_update ON public.article_tags;
CREATE TRIGGER on_article_tag_usage_update
  AFTER INSERT OR DELETE ON public.article_tags
  FOR EACH ROW EXECUTE FUNCTION public.update_tag_usage_count();

-- Function to update updated_at timestamp
CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON public.tags
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 4. VIEWS
-- ============================================

-- View for articles with tags
CREATE OR REPLACE VIEW public.articles_with_tags AS
SELECT 
  a.*,
  COALESCE(
    json_agg(
      json_build_object(
        'id', t.id,
        'name', t.name,
        'slug', t.slug,
        'color', t.color,
        'icon', t.icon
      )
    ) FILTER (WHERE t.id IS NOT NULL),
    '[]'::json
  ) as tags
FROM public.articles a
LEFT JOIN public.article_tags at ON a.id = at.article_id
LEFT JOIN public.tags t ON at.tag_id = t.id AND t.enabled = true
WHERE a.published = true
GROUP BY a.id;

-- View for tags with article count
CREATE OR REPLACE VIEW public.tags_with_count AS
SELECT 
  t.*,
  COUNT(at.article_id) FILTER (WHERE EXISTS (
    SELECT 1 FROM public.articles a 
    WHERE a.id = at.article_id AND a.published = true
  )) as published_article_count
FROM public.tags t
LEFT JOIN public.article_tags at ON t.id = at.tag_id
WHERE t.enabled = true
GROUP BY t.id
ORDER BY t.usage_count DESC, t.name;

-- ============================================
-- 5. INSERT DEFAULT TAGS
-- ============================================
INSERT INTO public.tags (name, slug, description, color, icon, enabled)
VALUES
  ('Vue.js', 'vuejs', 'Vue.js Framework', '#4FC08D', 'vuejs', true),
  ('JavaScript', 'javascript', 'JavaScript Programming', '#F7DF1E', 'javascript', true),
  ('TypeScript', 'typescript', 'TypeScript Programming', '#3178C6', 'typescript', true),
  ('CSS', 'css', 'CSS Styling', '#1572B6', 'css', true),
  ('HTML', 'html', 'HTML Markup', '#E34F26', 'html', true),
  ('PWA', 'pwa', 'Progressive Web App', '#5A0FC8', 'pwa', true),
  ('Supabase', 'supabase', 'Supabase Backend', '#3ECF8E', 'supabase', true),
  ('Firebase', 'firebase', 'Firebase Services', '#FFCA28', 'firebase', true),
  ('Web Development', 'web-development', 'Web Development', '#4285F4', 'web-development', true),
  ('Mobile Development', 'mobile-development', 'Mobile Development', '#000000', 'mobile-development', true),
  ('UI/UX', 'ui-ux', 'User Interface and User Experience', '#FF6B6B', 'ui-ux', true),
  ('Design', 'design', 'Design', '#FF6B9D', 'design', true),
  ('Tutorial', 'tutorial', 'Tutorial Articles', '#4ECDC4', 'tutorial', true),
  ('Tips & Tricks', 'tips-tricks', 'Tips and Tricks', '#95E1D3', 'tips-tricks', true),
  ('Best Practices', 'best-practices', 'Best Practices', '#F38181', 'best-practices', true)
ON CONFLICT (slug) DO NOTHING;

