ALTER TABLE user_gp_guides
  ADD COLUMN bonus_percentage   integer   NOT NULL DEFAULT 0,
  ADD COLUMN bonus_driver_ids   uuid[]    NOT NULL DEFAULT '{}',
  ADD COLUMN bonus_car_part_ids uuid[]    NOT NULL DEFAULT '{}';
