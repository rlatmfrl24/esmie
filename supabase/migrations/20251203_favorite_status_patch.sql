-- Favorite prompt status/snapshot enhancements and helper RPC
BEGIN;

ALTER TABLE favorite_prompts
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS snapshot_created_at timestamptz DEFAULT now();

UPDATE favorite_prompts
   SET status = CASE WHEN prompt_deleted_at IS NULL THEN 'ACTIVE' ELSE 'ORPHAN' END,
       snapshot_created_at = COALESCE(snapshot_created_at, created_at, NOW())
 WHERE status IS NULL
    OR snapshot_created_at IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'favorite_prompts_status_check'
      AND conrelid = 'favorite_prompts'::regclass
  ) THEN
    ALTER TABLE favorite_prompts
      ADD CONSTRAINT favorite_prompts_status_check
      CHECK (status IN ('ACTIVE', 'ORPHAN'));
  END IF;
END;
$$;

CREATE OR REPLACE VIEW public.view_prompts_with_favorite AS
SELECT
  p.*,
  EXISTS (
    SELECT 1
    FROM favorite_prompts f
    WHERE f.prompt_id = p.id
      AND f.user_id = auth.uid()
      AND f.status = 'ACTIVE'
      AND f.prompt_deleted_at IS NULL
  ) AS is_favorite,
  (
    SELECT f.id
    FROM favorite_prompts f
    WHERE f.prompt_id = p.id
      AND f.user_id = auth.uid()
    ORDER BY f.created_at DESC
    LIMIT 1
  ) AS favorite_id,
  (
    SELECT f.status
    FROM favorite_prompts f
    WHERE f.prompt_id = p.id
      AND f.user_id = auth.uid()
    ORDER BY f.created_at DESC
    LIMIT 1
  ) AS favorite_status,
  (
    SELECT f.snapshot_created_at
    FROM favorite_prompts f
    WHERE f.prompt_id = p.id
      AND f.user_id = auth.uid()
    ORDER BY f.created_at DESC
    LIMIT 1
  ) AS favorite_snapshot_created_at
FROM prompts p
WHERE (p.user_id = auth.uid() OR auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.mark_favorite_orphan()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE favorite_prompts
     SET prompt_deleted_at = NOW(),
         status = 'ORPHAN'
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
     SET prompt_deleted_at = NULL,
         status = 'ACTIVE',
         snapshot_created_at = NOW()
   WHERE prompt_id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_revive_favorite_prompt_link ON prompts;
CREATE TRIGGER trg_revive_favorite_prompt_link
AFTER INSERT ON prompts
FOR EACH ROW EXECUTE FUNCTION public.revive_favorite_prompt_link();

DROP FUNCTION IF EXISTS public.copy_favorite_to_prompts(uuid);
CREATE OR REPLACE FUNCTION public.copy_favorite_to_prompts(favorite_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  target favorite_prompts%ROWTYPE;
  inserted prompts%ROWTYPE;
BEGIN
  SELECT *
    INTO target
    FROM favorite_prompts
    WHERE id = favorite_uuid
      AND user_id = auth.uid()
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Favorite not found' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO prompts (
    core_theme,
    version,
    hair,
    pose,
    outfit,
    atmosphere,
    gaze,
    makeup,
    background,
    final_prompt,
    aspect_ratio,
    details,
    user_id
  )
  VALUES (
    target.core_theme,
    target.version,
    target.hair,
    target.pose,
    target.outfit,
    target.atmosphere,
    target.gaze,
    target.makeup,
    target.background,
    target.final_prompt,
    target.aspect_ratio,
    target.details,
    auth.uid()
  )
  RETURNING * INTO inserted;

  UPDATE favorite_prompts
     SET prompt_id = inserted.id,
         prompt_deleted_at = NULL,
         status = 'ACTIVE',
         snapshot_json = row_to_json(inserted)::jsonb,
         snapshot_created_at = NOW()
   WHERE id = favorite_uuid;

  RETURN inserted.id;
END;
$$;

COMMIT;





