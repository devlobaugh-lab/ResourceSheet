-- Query to get rarity 5 drivers with their ordinal, collectionId, and collection theme
SELECT 
    d.ordinal,
    d.collection_id,
    c.theme,
    d.name,
    d.id as driver_id,
    c.name as collection_name,
    c.season,
    c.internal_name
FROM drivers d
LEFT JOIN collections c ON d.collection_id = c.id
WHERE d.rarity = 5
ORDER BY d.ordinal ASC;