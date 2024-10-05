// Local Imports
import pool from "../db/pool";

export const getAllAuthorsQuery = async () => {
  const { rows } = await pool.query(`SELECT * FROM authors`);

  return rows;
};

export const createNewAuthorQuery = async (name: string, bio: string) => {
  await pool.query(
    `INSERT INTO authors ("name", bio)
   VALUES ($1, $2)`,
    [name, bio]
  );
};

export const getAuthorByIdQuery = async (id: number) => {
  const { rows } = await pool.query(
    `SELECT * FROM authors
     WHERE id = $1`,
    [id]
  );

  return rows[0];
};

export const updateAuthorByIdQuery = async (
  name: string,
  bio: string,
  id: number
) => {
  await pool.query(
    `UPDATE authors
    SET "name" = $1, bio = $2
     WHERE id = $3`,
    [name, bio, id]
  );
};

export const deleteAuthorByIdQuery = async (id: number) => {
  await pool.query(
    `DELETE FROM authors
     WHERE id = $1`,
    [id]
  );
};
