BEGIN;

-- Add origin_type and item_uid columns to trash table
-- origin_type: indicates whether the item came from 'PROMPT' or 'FAVORITE'
-- item_uid: stores the original UUID id for restoration reference

ALTER TABLE IF EXISTS trash
  ADD COLUMN IF NOT EXISTS origin_type text,
  ADD COLUMN IF NOT EXISTS item_uid uuid;

-- Add constraint to ensure origin_type is one of the valid values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'trash_origin_type_check'
      AND conrelid = 'trash'::regclass
  ) THEN
    ALTER TABLE trash
      ADD CONSTRAINT trash_origin_type_check
      CHECK (origin_type IS NULL OR origin_type IN ('PROMPT', 'FAVORITE'));
  END IF;
END;
$$;

COMMIT;




