// Local Imports
import pool from "../db/pool";

export const getAllGenresQuery = async () => {
  const { rows } = await pool.query(`SELECT * FROM genres`);

  return rows;
};

export const createNewGenreQuery = async (name: string) => {
  await pool.query(
    `INSERT INTO genres ("name")
   VALUES ($1)`,
    [name]
  );
};

export const getGenreByIdQuery = async (id: number) => {
  const { rows } = await pool.query(
    `SELECT * FROM genres
     WHERE id = $1`,
    [id]
  );

  return rows[0];
};

export const updateGenreByIdQuery = async (name: string, id: number) => {
  await pool.query(
    `UPDATE genres
    SET "name" = $1
     WHERE id = $2`,
    [name, id]
  );
};

export const deleteGenreByIdQuery = async (id: number) => {
  await pool.query(
    `DELETE FROM genres
     WHERE id = $1`,
    [id]
  );
};
