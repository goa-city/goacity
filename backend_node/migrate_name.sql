ALTER TABLE members ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
UPDATE members 
SET first_name = split_part(full_name, ' ', 1), 
    last_name = CASE WHEN position(' ' in full_name) > 0 THEN trim(substr(full_name, position(' ' in full_name) + 1)) ELSE '' END;
ALTER TABLE members DROP COLUMN IF EXISTS full_name;
