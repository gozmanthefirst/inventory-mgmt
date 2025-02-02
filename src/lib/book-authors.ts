// Local Imports
import pool from "../db/pool";

//! IMPORTANT!
export const getBookAuthorsByBookIdQuery = async (bookId: number) => {
  const { rows } = await pool.query(
    `SELECT a.id AS author_id, a.name, a.bio
    FROM book_authors ba
    JOIN authors a ON ba.author_id = a.id
    WHERE ba.book_id = $1`,
    [bookId]
  );

  return rows.map((row) => ({
    id: row.author_id as number,
    name: row.name as string,
  }));
};

export const getAuthorIdByBookIdQuery = async (bookId: number) => {
  const { rows } = await pool.query(
    `SELECT author_id FROM book_authors
    WHERE book_id = $1`,
    [bookId]
  );

  return rows;
};

export const getBookIdByAuthorIdQuery = async (authorId: number) => {
  const { rows } = await pool.query(
    `SELECT book_id FROM book_authors
    WHERE author_id = $1`,
    [authorId]
  );

  return rows;
};

export const createNewBookAuthorQuery = async (
  bookId: number,
  authorId: number
) => {
  await pool.query(
    `INSERT INTO book_authors (book_id, author_id)
   VALUES ($1, $2)`,
    [bookId, authorId]
  );
};
