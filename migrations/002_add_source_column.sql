ALTER TABLE assets
ADD COLUMN IF NOT EXISTS source TEXT;

UPDATE assets
SET source = 'Hibah'
WHERE source IS NULL;
