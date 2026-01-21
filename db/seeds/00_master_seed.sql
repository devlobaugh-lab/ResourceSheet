-- Master Seed File for F1 Resource Manager
-- Run these files in order to populate the database

\i 01_seasons.sql
\i 02_car_parts.sql  
\i 03_drivers.sql
\i 04_boosts.sql

-- Verify data
SELECT 'Seasons' as table_name, COUNT(*) as count FROM seasons
UNION ALL
SELECT 'Car Parts', COUNT(*) FROM car_parts
UNION ALL
SELECT 'Drivers', COUNT(*) FROM drivers
UNION ALL
SELECT 'Boosts', COUNT(*) FROM boosts;
