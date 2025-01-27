-- Alter authors table
ALTER TABLE authors DROP COLUMN author_name;

ALTER TABLE authors
ADD COLUMN author_name TEXT NOT NULL UNIQUE;