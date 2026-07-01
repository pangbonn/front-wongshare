-- Add is_pinned column to articles
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_articles_pinned ON public.articles(is_pinned DESC, created_at DESC);
