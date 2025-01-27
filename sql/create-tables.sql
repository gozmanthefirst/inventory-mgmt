--* Create books table
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  book_desc TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  isbn VARCHAR(13) UNIQUE NOT NULL,
  publisher TEXT NOT NULL,
  published_date DATE NOT NULL,
  page_count INT NOT NULL,
  available_as_epub BOOLEAN NOT NULL DEFAULT FALSE,
  available_as_pdf BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--* Create authors table
CREATE TABLE IF NOT EXISTS authors (
  id SERIAL PRIMARY KEY,
  author_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--* Create genres table
CREATE TABLE IF NOT EXISTS genres (
  id SERIAL PRIMARY KEY,
  genre_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--* Create book_authors junction table
CREATE TABLE IF NOT EXISTS book_authors (
  book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  author_id INT NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, author_id)
);

--* Create book_genres junction table
CREATE TABLE IF NOT EXISTS book_genres (
  book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  genre_id INT NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, genre_id)
);

--* Single function for all tables to update updated_at column in the tables
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS '
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
' LANGUAGE plpgsql;

-- Create the trigger for books table
CREATE TRIGGER books_updated_at_trigger BEFORE
UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_updated_at ();

-- Create the trigger for authors table
CREATE TRIGGER authors_updated_at_trigger BEFORE
UPDATE ON authors FOR EACH ROW EXECUTE FUNCTION update_updated_at ();

-- Create the trigger for genres table
CREATE TRIGGER genres_updated_at_trigger BEFORE
UPDATE ON genres FOR EACH ROW EXECUTE FUNCTION update_updated_at ();