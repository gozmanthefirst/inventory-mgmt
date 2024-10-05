// Local Imports
import pool from "../db/pool";

export const getBookGenresByBookIdQuery = async (bookId: number) => {
  const { rows } = await pool.query(
    `SELECT g.id AS genre_id, g.name 
    FROM book_genres bg
    JOIN genres g ON bg.genre_id = g.id
    WHERE bg.book_id = $1`,
    [bookId]
  );

  return rows.map((row) => ({
    id: row.genre_id as number,
    name: row.name as string,
  }));
};

export const createNewBookGenreQuery = async (
  bookid: number,
  genreId: number
) => {
  await pool.query(
    `INSERT INTO book_genres (book_id, genre_id)
   VALUES ($1, $2)`,
    [bookid, genreId]
  );
};
