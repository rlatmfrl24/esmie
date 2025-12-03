BEGIN;

DROP FUNCTION IF EXISTS public.copy_favorite_to_prompts(uuid);

CREATE OR REPLACE FUNCTION public.copy_favorite_to_prompts(
  favorite_uuid uuid,
  user_uuid uuid
)
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
     AND user_id = user_uuid
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
    user_uuid
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

