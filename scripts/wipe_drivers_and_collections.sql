-- Safe wipe script for drivers and collections data
-- This script preserves user data and other tables

-- Backup current data (optional - uncomment if you want to create backups)
-- CREATE TABLE drivers_backup AS SELECT * FROM drivers;
-- CREATE TABLE collections_backup AS SELECT * FROM collections;
-- CREATE TABLE car_parts_backup AS SELECT * FROM car_parts;

-- Disable triggers temporarily to avoid conflicts
ALTER TABLE drivers DISABLE TRIGGER ALL;
ALTER TABLE car_parts DISABLE TRIGGER ALL;
ALTER TABLE collections DISABLE TRIGGER ALL;
ALTER TABLE user_drivers DISABLE TRIGGER ALL;
ALTER TABLE user_car_parts DISABLE TRIGGER ALL;

-- Clear data from the tables we want to wipe
-- Note: This will cascade to user_drivers and user_car_parts due to foreign key constraints
DELETE FROM user_drivers;
DELETE FROM user_car_parts;
DELETE FROM drivers;
DELETE FROM car_parts;
DELETE FROM collections;

-- Re-enable triggers
ALTER TABLE drivers ENABLE TRIGGER ALL;
ALTER TABLE car_parts ENABLE TRIGGER ALL;
ALTER TABLE collections ENABLE TRIGGER ALL;
ALTER TABLE user_drivers ENABLE TRIGGER ALL;
ALTER TABLE user_car_parts ENABLE TRIGGER ALL;

-- Reset sequences if needed
SELECT setval('drivers_id_seq', 1, false);
SELECT setval('car_parts_id_seq', 1, false);
SELECT setval('collections_id_seq', 1, false);
SELECT setval('user_drivers_id_seq', 1, false);
SELECT setval('user_car_parts_id_seq', 1, false);

-- Verify the wipe was successful
SELECT 'Drivers count: ' || COUNT(*) FROM drivers;
SELECT 'Car parts count: ' || COUNT(*) FROM car_parts;
SELECT 'Collections count: ' || COUNT(*) FROM collections;
SELECT 'User drivers count: ' || COUNT(*) FROM user_drivers;
SELECT 'User car parts count: ' || COUNT(*) FROM user_car_parts;

-- Note: Other tables like boosts, user_boosts, seasons, profiles, etc. are preserved