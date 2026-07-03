ALTER TABLE assets
ADD COLUMN IF NOT EXISTS images JSONB;

UPDATE assets
SET images = CASE
  WHEN receipt_url IS NULL THEN '[]'::jsonb
  WHEN receipt_url LIKE '[' THEN receipt_url::jsonb
  ELSE jsonb_build_array(receipt_url)
END
WHERE images IS NULL;
