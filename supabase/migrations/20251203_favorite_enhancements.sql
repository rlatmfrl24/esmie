-- Favorite prompt enhancements: snapshot storage, soft-linking, and helper view
BEGIN;

ALTER TABLE favorite_prompts
  ADD COLUMN IF NOT EXISTS snapshot_json jsonb,
  ADD COLUMN IF NOT EXISTS prompt_deleted_at timestamptz;

CREATE OR REPLACE VIEW public.view_prompts_with_favorite AS
SELECT
  p.*,
  EXISTS (
    SELECT 1
    FROM favorite_prompts f
    WHERE f.prompt_id = p.id
      AND f.user_id = auth.uid()
      AND f.prompt_deleted_at IS NULL
  ) AS is_favorite,
  (
    SELECT f.id
    FROM favorite_prompts f
    WHERE f.prompt_id = p.id
      AND f.user_id = auth.uid()
    ORDER BY f.created_at DESC
    LIMIT 1
  ) AS favorite_id
FROM prompts p
WHERE (p.user_id = auth.uid() OR auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.mark_favorite_orphan()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE favorite_prompts
     SET prompt_deleted_at = NOW()
   WHERE prompt_id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_mark_favorite_orphan ON prompts;
CREATE TRIGGER trg_mark_favorite_orphan
AFTER DELETE ON prompts
FOR EACH ROW EXECUTE FUNCTION public.mark_favorite_orphan();

CREATE OR REPLACE FUNCTION public.revive_favorite_prompt_link()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE favorite_prompts
     SET prompt_deleted_at = NULL
   WHERE prompt_id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_revive_favorite_prompt_link ON prompts;
CREATE TRIGGER trg_revive_favorite_prompt_link
AFTER INSERT ON prompts
FOR EACH ROW EXECUTE FUNCTION public.revive_favorite_prompt_link();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'favorite_prompts'
      AND policyname = 'favorite_owner_read'
  ) THEN
    CREATE POLICY favorite_owner_read
      ON favorite_prompts
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END;
$$;

COMMIT;

