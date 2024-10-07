// External Imports
import { RequestHandler } from "express";

// Local Imports
import { Author, Book, Genre, HttpStatusCode } from "../../types";
import { HttpError } from "../interfaces/httpError";
import { getAuthorByIdQuery } from "../lib/authors";
import {
  createNewBookAuthorQuery,
  getBookAuthorsByBookIdQuery,
} from "../lib/book-authors";
import {
  createNewBookGenreQuery,
  getBookGenresByBookIdQuery,
} from "../lib/book-genres";
import {
  createNewBookQuery,
  deleteBookByIdQuery,
  getAllBooksQuery,
  getBookByIdQuery,
  updateBookByIdQuery,
} from "../lib/books";
import { getGenreByIdQuery } from "../lib/genres";
import { errorResponse, successResponse } from "../utils/api-response";

/**
 * Gets all the books
 * @route GET /
 */
export const getAllBooks: RequestHandler = async (req, res, next) => {
  try {
    const books: Book[] = await getAllBooksQuery();
    return res.json(successResponse("Books successfully retrieved.", books));
  } catch (error) {
    (error as HttpError).status = HttpStatusCode.INTERNAL_SERVER_ERROR;
    return next(error);
  }
};

/**
 * Creates a new book
 * @route POST /
 */
export const createBook: RequestHandler = async (req, res, next) => {
  try {
    const { title, isbn, pubYear, quantity, price, authorIds, genreIds } =
      req.body;

    // Check if authorIds and genreIds are arrays
    if (!Array.isArray(authorIds)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_DATA", ["Author IDs must be an array."]));
    }

    if (!Array.isArray(genreIds)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_DATA", ["Genre IDs must be an array."]));
    }

    // Check for required fields
    const requiredFields = [
      { name: "title", value: title },
      { name: "isbn", value: isbn },
      { name: "pubYear", value: pubYear },
      { name: "quantity", value: quantity },
      { name: "price", value: price },
    ];

    for (const field of requiredFields) {
      if (!field.value) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json(
            errorResponse("INVALID_DATA", [
              `${
                field.name.charAt(0).toUpperCase() + field.name.slice(1)
              } is required.`,
            ])
          );
      }
    }

    // Check if authors exist
    for (const authorId of authorIds) {
      const author: Author = await getAuthorByIdQuery(authorId);
      if (!author) {
        return res
          .status(HttpStatusCode.NOT_FOUND)
          .json(errorResponse("NOT_FOUND", "One or more authors not found."));
      }
    }

    // Check if genres exist
    for (const genreId of genreIds) {
      const genre: Genre = await getGenreByIdQuery(genreId);
      if (!genre) {
        return res
          .status(HttpStatusCode.NOT_FOUND)
          .json(errorResponse("NOT_FOUND", "One or more genres not found."));
      }
    }

    // Create the book
    const bookId = await createNewBookQuery(
      title,
      isbn,
      pubYear,
      quantity,
      price
    );

    // Add authors to book_authors table, avoiding duplicates
    const existingAuthors = await getBookAuthorsByBookIdQuery(bookId);
    const existingAuthorIds = existingAuthors.map((author) => author.id);

    for (const authorId of authorIds) {
      if (!existingAuthorIds.includes(Number(authorId))) {
        await createNewBookAuthorQuery(bookId, Number(authorId));
      }
    }

    // Add genres to book_genres table, avoiding duplicates
    const existingGenres = await getBookGenresByBookIdQuery(bookId);
    const existingGenreIds = existingGenres.map((genre) => genre.id);

    for (const genreId of genreIds) {
      if (!existingGenreIds.includes(Number(genreId))) {
        await createNewBookGenreQuery(bookId, Number(genreId));
      }
    }

    return res.json(successResponse("Book successfully created."));
  } catch (error) {
    (error as HttpError).status = HttpStatusCode.INTERNAL_SERVER_ERROR;
    return next(error);
  }
};

/**
 * Gets a single book
 * @route GET /:id
 */
export const getBook: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // Return an error if id is not a valid number
    if (typeof id !== "number" || isNaN(id)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_ID", "Invalid book id."));
    }

    const book: Book = await getBookByIdQuery(id);

    // Return an error if the book was not found
    if (!book) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json(errorResponse("NOT_FOUND", "Book not found."));
    }

    return res.json(successResponse("Book successfully retrieved.", book));
  } catch (error) {
    (error as HttpError).status = HttpStatusCode.INTERNAL_SERVER_ERROR;
    return next(error);
  }
};

/**
 * Updates a single book
 * @route POST /:id
 */
export const updateBook: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { title, isbn, pubYear, quantity, price, authorIds, genreIds } =
      req.body;

    // Return an error if id is not a valid number
    if (typeof id !== "number" || isNaN(id)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_ID", "Invalid book id."));
    }

    const book: Book = await getBookByIdQuery(id);

    // Return an error if the book was not found
    if (!book) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json(errorResponse("NOT_FOUND", "Book not found."));
    }

    // Check if authorIds and genreIds are arrays
    if (!Array.isArray(authorIds)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_DATA", ["Author IDs must be an array."]));
    }

    if (!Array.isArray(genreIds)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_DATA", ["Genre IDs must be an array."]));
    }

    // Check for required fields
    const requiredFields = [
      { name: "title", value: title },
      { name: "isbn", value: isbn },
      { name: "pubYear", value: pubYear },
      { name: "quantity", value: quantity },
      { name: "price", value: price },
    ];

    for (const field of requiredFields) {
      if (!field.value) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json(
            errorResponse("INVALID_DATA", [
              `${
                field.name.charAt(0).toUpperCase() + field.name.slice(1)
              } is required.`,
            ])
          );
      }
    }

    // TODO: If author ID changes, (the authors of a book gets changed), the book_author record for the ex-author doesnt get removed. Fix it.

    // Check if authors exist
    for (const authorId of authorIds) {
      const author: Author = await getAuthorByIdQuery(authorId);

      if (!author) {
        return res
          .status(HttpStatusCode.NOT_FOUND)
          .json(errorResponse("NOT_FOUND", "Author not found."));
      }
    }

    // TODO: If genre ID changes, (the genres of a book gets changed), the book_genre record for the ex-genre doesnt get removed. Fix it.

    // Check if genres exist
    for (const genreId of genreIds) {
      const genre: Genre = await getGenreByIdQuery(genreId);

      if (!genre) {
        return res
          .status(HttpStatusCode.NOT_FOUND)
          .json(errorResponse("NOT_FOUND", "Genre not found."));
      }
    }

    // Update book
    await updateBookByIdQuery(
      title ? title : book.title,
      isbn ? isbn : book.isbn,
      pubYear ? pubYear : book.pub_year,
      quantity ? quantity : book.quantity,
      price ? price : book.price,
      id
    );

    // Get existing author relationships
    const existingAuthors = await getBookAuthorsByBookIdQuery(id);
    const existingAuthorIds = existingAuthors.map((author) => author.id);

    // Add authors to book_authors table avoiding duplicates
    for (const authorId of authorIds) {
      if (!existingAuthorIds.includes(Number(authorId))) {
        await createNewBookAuthorQuery(id, Number(authorId));
      }
    }

    // Get existing genre relationships
    const existingGenres = await getBookGenresByBookIdQuery(id);
    const existingGenreIds = existingGenres.map((genre) => genre.id);

    // Add genres to book_genres table avoiding duplicates
    for (const genreId of genreIds) {
      if (!existingGenreIds.includes(Number(genreId))) {
        await createNewBookGenreQuery(id, Number(genreId));
      }
    }

    return res.json(successResponse("Book successfully updated."));
  } catch (error) {
    (error as HttpError).status = HttpStatusCode.INTERNAL_SERVER_ERROR;
    return next(error);
  }
};

/**
 * Deletes a single book
 * @route DELETE /:id
 */
export const deleteBook: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // Return an error if id is not a valid number
    if (typeof id !== "number" || isNaN(id)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_ID", "Invalid book id."));
    }

    const book: Book = await getBookByIdQuery(id);

    // Return an error if the book was not found
    if (!book) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json(errorResponse("NOT_FOUND", "Book not found."));
    }

    await deleteBookByIdQuery(id);

    return res.json(successResponse("Book successfully deleted."));
  } catch (error) {
    (error as HttpError).status = HttpStatusCode.INTERNAL_SERVER_ERROR;
    return next(error);
  }
};
