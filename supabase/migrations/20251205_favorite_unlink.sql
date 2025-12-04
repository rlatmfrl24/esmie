BEGIN;

-- Drop dependent view/trigger/RPC objects first so columns can be removed safely.
DROP VIEW IF EXISTS public.view_prompts_with_favorite;

DROP TRIGGER IF EXISTS trg_mark_favorite_orphan ON prompts;
DROP FUNCTION IF EXISTS public.mark_favorite_orphan();

DROP TRIGGER IF EXISTS trg_revive_favorite_prompt_link ON prompts;
DROP FUNCTION IF EXISTS public.revive_favorite_prompt_link();

DROP FUNCTION IF EXISTS public.copy_favorite_to_prompts(uuid, uuid);
DROP FUNCTION IF EXISTS public.copy_favorite_to_prompts(uuid);

-- Remove favorite↔prompt linkage columns
ALTER TABLE IF EXISTS favorite_prompts
  DROP COLUMN IF EXISTS prompt_id,
  DROP COLUMN IF EXISTS snapshot_json,
  DROP COLUMN IF EXISTS prompt_deleted_at,
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS snapshot_created_at;

ALTER TABLE IF EXISTS favorite_prompts
  DROP CONSTRAINT IF EXISTS favorite_prompts_status_check;

COMMIT;

