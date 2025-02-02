// Local Imports
import pool from "../db/pool";

export const getAllGenresQuery = async () => {
  const { rows } = await pool.query(`SELECT * FROM genres`);

  return rows;
};

export const createNewGenreQuery = async (name: string) => {
  const { rows } = await pool.query(
    `INSERT INTO genres (genre_name)
   VALUES ($1)
   RETURNING id`,
    [name]
  );

  return Number(rows[0].id);
};

export const getGenreByNameQuery = async (name: string) => {
  const { rows } = await pool.query(
    `SELECT * FROM genres
     WHERE genre_name = $1`,
    [name]
  );

  return rows[0];
};

export const deleteGenreByIdQuery = async (id: number) => {
  await pool.query(
    `DELETE FROM genres
     WHERE id = $1`,
    [id]
  );
};
