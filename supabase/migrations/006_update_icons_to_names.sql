-- ============================================
-- Update Icons from Emoji to Icon Names
-- Vue Blog Application
-- ============================================

-- Update categories icons
UPDATE public.categories SET icon = 'technology' WHERE slug = 'technology' AND icon = '💻';
UPDATE public.categories SET icon = 'design' WHERE slug = 'design' AND icon = '🎨';
UPDATE public.categories SET icon = 'business' WHERE slug = 'business' AND icon = '💼';
UPDATE public.categories SET icon = 'lifestyle' WHERE slug = 'lifestyle' AND icon = '🌟';
UPDATE public.categories SET icon = 'education' WHERE slug = 'education' AND icon = '📚';
UPDATE public.categories SET icon = 'health' WHERE slug = 'health' AND icon = '🏥';
UPDATE public.categories SET icon = 'travel' WHERE slug = 'travel' AND icon = '✈️';
UPDATE public.categories SET icon = 'food' WHERE slug = 'food' AND icon = '🍽️';
UPDATE public.categories SET icon = 'sports' WHERE slug = 'sports' AND icon = '⚽';
UPDATE public.categories SET icon = 'entertainment' WHERE slug = 'entertainment' AND icon = '🎬';

-- Update tags icons
UPDATE public.tags SET icon = 'vuejs' WHERE slug = 'vuejs' AND (icon = '🟢' OR icon LIKE '%vue%');
UPDATE public.tags SET icon = 'javascript' WHERE slug = 'javascript' AND (icon = '🟡' OR icon LIKE '%js%');
UPDATE public.tags SET icon = 'typescript' WHERE slug = 'typescript' AND (icon = '🔵' OR icon LIKE '%ts%');
UPDATE public.tags SET icon = 'css' WHERE slug = 'css' AND (icon = '💙' OR icon LIKE '%css%');
UPDATE public.tags SET icon = 'html' WHERE slug = 'html' AND (icon = '🟠' OR icon LIKE '%html%');
UPDATE public.tags SET icon = 'pwa' WHERE slug = 'pwa' AND icon = '📱';
UPDATE public.tags SET icon = 'supabase' WHERE slug = 'supabase' AND (icon = '🟢' OR icon LIKE '%supabase%');
UPDATE public.tags SET icon = 'firebase' WHERE slug = 'firebase' AND (icon = '🟡' OR icon LIKE '%firebase%');
UPDATE public.tags SET icon = 'web-development' WHERE slug = 'web-development' AND icon = '🌐';
UPDATE public.tags SET icon = 'mobile-development' WHERE slug = 'mobile-development' AND icon = '📱';
UPDATE public.tags SET icon = 'ui-ux' WHERE slug = 'ui-ux' AND icon = '🎨';
UPDATE public.tags SET icon = 'design' WHERE slug = 'design' AND icon = '✨';
UPDATE public.tags SET icon = 'tutorial' WHERE slug = 'tutorial' AND icon = '📚';
UPDATE public.tags SET icon = 'tips-tricks' WHERE slug = 'tips-tricks' AND icon = '💡';
UPDATE public.tags SET icon = 'best-practices' WHERE slug = 'best-practices' AND icon = '⭐';

