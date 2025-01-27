// Local Imports
import pool from "../db/pool";

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

export const deleteBookAuthorQuery = async (bookid: number) => {
  await pool.query(
    `DELETE FROM book_authors
    WHERE book_id = $1`,
    [bookid]
  );
};
