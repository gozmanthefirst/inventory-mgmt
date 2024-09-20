-- Create books table
CREATE TABLE
  IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    isbn VARCHAR(13) NOT NULL UNIQUE,
    pub_year INT, -- publication year
    quantity INT,
    price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

-- Create authors table
CREATE TABLE
  IF NOT EXISTS authors (
    id SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

-- Create genres table
CREATE TABLE
  IF NOT EXISTS genres (
    id SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

-- Create book_authors join table
CREATE TABLE
  IF NOT EXISTS book_authors (
    id SERIAL PRIMARY KEY,
    book_id INT REFERENCES books (id) ON DELETE CASCADE,
    author_id INT REFERENCES authors (id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

-- Create book_genres join table
CREATE TABLE
  IF NOT EXISTS book_genres (
    id SERIAL PRIMARY KEY,
    book_id INT REFERENCES books (id) ON DELETE CASCADE,
    genre_id INT REFERENCES genres (id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );