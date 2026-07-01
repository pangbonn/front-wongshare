-- Drop any triggers on articles that reference pg_net functions
-- (leftover from previous unknown migrations 012-014)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT t.tgname, t.tgrelid::regclass AS tbl
    FROM pg_trigger t
    JOIN pg_proc p ON p.oid = t.tgfoid
    WHERE t.tgrelid = 'public.articles'::regclass
      AND (
        p.proname ILIKE '%net%'
        OR p.proname ILIKE '%webhook%'
        OR p.proname ILIKE '%http%'
        OR p.proname ILIKE '%notify%'
        OR p.prosrc ILIKE '%pg_net%'
      )
      AND t.tgname NOT IN ('handle_updated_at', 'update_articles_updated_at')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %s', r.tgname, r.tbl);
    RAISE NOTICE 'Dropped trigger: %', r.tgname;
  END LOOP;
END;
$$;

-- Also drop any orphaned functions that reference pg_net on articles context
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT p.proname, p.oid
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosrc ILIKE '%pg_net%'
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS public.%I CASCADE', r.proname);
    RAISE NOTICE 'Dropped function: %', r.proname;
  END LOOP;
END;
$$;
