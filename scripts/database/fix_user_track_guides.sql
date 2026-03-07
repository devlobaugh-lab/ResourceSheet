-- Fix foreign key constraint violations in user_track_guides
-- Map old track IDs to current track IDs

-- First, let's see what track IDs are currently in user_track_guides that don't exist in tracks
SELECT DISTINCT utg.track_id, t.name as current_track_name
FROM user_track_guides utg
LEFT JOIN tracks t ON utg.track_id = t.id
WHERE t.id IS NULL;

-- Map problematic track IDs to existing tracks
-- Based on the error messages, we need to map:
-- 00000000-0000-0000-0000-000000000005 -> likely a placeholder, should be removed or mapped
-- 3e1354cb-1d37-4b10-b20a-f1b1dbfab419 -> likely an old UUID
-- 1d04038f-5425-4989-acc9-dc308fdd833c -> likely an old UUID

-- Let's get the current track IDs for reference
SELECT id, name FROM tracks ORDER BY name;

-- Update statements to fix the foreign key violations
-- Note: These mappings are educated guesses based on common track names
-- You may need to adjust these based on the actual track names in the user data

-- Example mappings (adjust as needed):
-- UPDATE user_track_guides SET track_id = 'ebe50201-4398-4bda-99b0-49177aaf0eb3' WHERE track_id = '00000000-0000-0000-0000-000000000005';
-- UPDATE user_track_guides SET track_id = '12e030e4-28d0-4e26-9725-552bde90ff73' WHERE track_id = '3e1354cb-1d37-4b10-b20a-f1b1dbfab419';
-- UPDATE user_track_guides SET track_id = 'ed34468f-dd09-4b34-b461-43d56f3d9bf5' WHERE track_id = '1d04038f-5425-4989-acc9-dc308fdd833c';

-- Remove entries with invalid track IDs (safer approach)
DELETE FROM user_track_guides 
WHERE track_id NOT IN (SELECT id FROM tracks);

-- Verify the fix
SELECT COUNT(*) as invalid_entries FROM user_track_guides utg
LEFT JOIN tracks t ON utg.track_id = t.id
WHERE t.id IS NULL;