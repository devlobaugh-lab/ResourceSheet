-- Add missing collections for Special Edition drivers
-- These are the collections referenced by the drivers in the database

-- Check if collections already exist, if not insert them
INSERT INTO collections (id, theme, description, name, ordinal) 
SELECT 'fa44edf3-f712-4e32-a94b-46f0187757c2', 'Hot Prospects', 'Hot Prospects Collection', 'Hot Prospects', 1
WHERE NOT EXISTS (SELECT 1 FROM collections WHERE id = 'fa44edf3-f712-4e32-a94b-46f0187757c2');

INSERT INTO collections (id, theme, description, name, ordinal) 
SELECT '1a4d9853-13e3-40ea-82d6-4891601e41b8', 'PS25', 'PS25 Collection', 'PS25', 2
WHERE NOT EXISTS (SELECT 1 FROM collections WHERE id = '1a4d9853-13e3-40ea-82d6-4891601e41b8');

INSERT INTO collections (id, theme, description, name, ordinal) 
SELECT 'f187e5a1-bcaf-4aa4-af07-70d220cd0cb2', 'F1 Legends', 'F1 Legends Collection', 'F1 Legends', 3
WHERE NOT EXISTS (SELECT 1 FROM collections WHERE id = 'f187e5a1-bcaf-4aa4-af07-70d220cd0cb2');

-- Update drivers to ensure they have the correct collection_sub_name values
UPDATE drivers SET collection_sub_name = 'SERVLOC_TXT_HOT_PROSPECT_COLLECTION_SUBTITLE_1' 
WHERE collection_id = 'fa44edf3-f712-4e32-a94b-46f0187757c2' 
AND collection_sub_name IS NULL;

UPDATE drivers SET collection_sub_name = 'SERVLOC_TXT_HOT_PROSPECT_COLLECTION_SUBTITLE_2' 
WHERE collection_id = 'fa44edf3-f712-4e32-a94b-46f0187757c2' 
AND collection_sub_name IS NULL;

-- Verify the collections were added
SELECT * FROM collections WHERE id IN ('fa44edf3-f712-4e32-a94b-46f0187757c2', '1a4d9853-13e3-40ea-82d6-4891601e41b8', 'f187e5a1-bcaf-4aa4-af07-70d220cd0cb2');
