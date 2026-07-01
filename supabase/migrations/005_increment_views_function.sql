-- ============================================
-- Increment Article Views Function
-- Vue Blog Application
-- ============================================

-- Function to increment article views count
CREATE OR REPLACE FUNCTION public.increment_article_views(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.articles
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

