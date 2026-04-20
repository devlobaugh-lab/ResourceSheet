UPDATE seasons SET season_number = 7 WHERE name = 'Season 7'; 
UPDATE seasons SET season_number = 6 WHERE name = 'Season 6'; 

SELECT id, name, season_number FROM seasons ORDER BY created_at;
