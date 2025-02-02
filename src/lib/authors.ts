// Local Imports
import pool from "../db/pool";

export const getAllAuthorsQuery = async () => {
  const { rows } = await pool.query(`SELECT * FROM authors`);

  return rows;
};

export const createNewAuthorQuery = async (name: string) => {
  const { rows } = await pool.query(
    `INSERT INTO authors (author_name)
   VALUES ($1)
   RETURNING id`,
    [name]
  );

  return Number(rows[0].id);
};

export const getAuthorByNameQuery = async (name: string) => {
  const { rows } = await pool.query(
    `SELECT * FROM authors
     WHERE author_name = $1`,
    [name]
  );

  return rows[0];
};

export const deleteAuthorByIdQuery = async (id: number) => {
  await pool.query(
    `DELETE FROM authors
     WHERE id = $1`,
    [id]
  );
};
