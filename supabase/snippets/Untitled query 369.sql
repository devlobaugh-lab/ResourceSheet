UPDATE seasons SET season_number = 7 WHERE name = 'Season 7'; 
UPDATE seasons SET season_number = 6 WHERE name = 'Season 6'; 

SELECT * FROM track_rotation_schedule WHERE season_id = '9ff6b443-6bf5-49cc-ae1a-d1d669add92d';

DELETE FROM track_rotation_schedule WHERE  season_id = '9ff6b443-6bf5-49cc-ae1a-d1d669add92d';
