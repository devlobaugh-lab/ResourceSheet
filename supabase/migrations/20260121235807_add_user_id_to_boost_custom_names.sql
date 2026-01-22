-- Add user_id column to boost_custom_names table

-- Add the column
ALTER TABLE boost_custom_names ADD COLUMN user_id UUID;

-- Add foreign key
ALTER TABLE boost_custom_names ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Add unique constraint
ALTER TABLE boost_custom_names ADD CONSTRAINT unique_boost_user UNIQUE (boost_id, user_id);

-- Add index
CREATE INDEX idx_user_id ON boost_custom_names(user_id);
