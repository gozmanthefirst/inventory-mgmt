// Local Imports
import pool from "../db/pool";

export const getAllBooksQuery = async () => {
  const { rows } = await pool.query(`SELECT * FROM books`);

  return rows;
};

export const createNewBookQuery = async (
  title: string,
  isbn: string,
  publisher: string,
  publishedDate: Date,
  pageCount: number,
  subtitle?: string,
  bookDesc?: string,
  imageUrl?: string,
  availableAsEpub?: boolean,
  availableAsPdf?: boolean
) => {
  const { rows } = await pool.query(
    `INSERT INTO books (title, subtitle, book_desc, image_url, isbn, publisher, published_date, page_count, available_as_epub, available_as_pdf)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
   RETURNING id`,
    [
      title,
      subtitle,
      bookDesc,
      imageUrl,
      isbn,
      publisher,
      publishedDate,
      pageCount,
      availableAsEpub,
      availableAsPdf,
    ]
  );

  return Number(rows[0].id);
};

export const getBookByIdQuery = async (id: number) => {
  const { rows } = await pool.query(
    `SELECT * FROM books
     WHERE id = $1`,
    [id]
  );

  return rows[0];
};

export const getBookByIsbn = async (isbn: string) => {
  const { rows } = await pool.query(
    `SELECT * FROM books
     WHERE isbn = $1`,
    [isbn]
  );

  return rows[0];
};

export const updateBookByIdQuery = async (
  title: string,
  isbn: string,
  pub_year: number,
  quantity: number,
  price: number,
  id: number
) => {
  await pool.query(
    `UPDATE books
    SET title = $1, isbn = $2, pub_year = $3, quantity = $4, price = $5
     WHERE id = $6`,
    [title, isbn, pub_year, quantity, price, id]
  );
};

export const deleteBookByIdQuery = async (id: number) => {
  await pool.query(
    `DELETE FROM books
     WHERE id = $1`,
    [id]
  );
};
