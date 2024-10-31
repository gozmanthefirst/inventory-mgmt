// External Imports
import { RequestHandler } from "express";

// Local Imports
import { Author, Book, Genre, HttpStatusCode } from "../../types";
import { HttpError } from "../interfaces/httpError";
import { getAuthorByIdQuery } from "../lib/authors";
import {
  createNewBookAuthorQuery,
  deleteBookAuthorQuery,
} from "../lib/book-authors";
import {
  createNewBookGenreQuery,
  deleteBookGenreQuery,
} from "../lib/book-genres";
import {
  createNewBookQuery,
  deleteBookByIdQuery,
  getAllBooksQuery,
  getBookByIdQuery,
  getBookByIsbn,
  updateBookByIdQuery,
} from "../lib/books";
import { getGenreByIdQuery } from "../lib/genres";
import { errorResponse, successResponse } from "../utils/api-response";
import { getCurrentYear } from "../utils/datetime";
import { removeDashesAndSpaces } from "../utils/string";

/**
 * Gets all the books
 * @route GET /
 */
export const getAllBooks: RequestHandler = async (req, res, next) => {
  try {
    const books: Book[] = await getAllBooksQuery();

    const updatedBooks = books.map((book) => ({
      ...book,
      price: Number(book.price),
    }));

    return res.json(
      successResponse("Books successfully retrieved.", updatedBooks)
    );
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

    //* Required Fields
    // Check for required fields
    const requiredFields = [
      { name: "Title", value: title },
      { name: "ISBN", value: isbn },
      { name: "Publication year", value: pubYear },
      { name: "Quantity", value: quantity },
      { name: "Price", value: price },
    ];

    for (const field of requiredFields) {
      if (!field.value) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json(errorResponse("INVALID_DATA", [`${field.name} is required.`]));
      }
    }

    //* ISBN
    if (isbn) {
      if (typeof isbn === "boolean") {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json(errorResponse("INVALID_DATA", ["Invalid ISBN."]));
      }

      const modifiedIsbn = removeDashesAndSpaces(String(isbn));
      const numericIsbn = Number(modifiedIsbn);

      if (
        isNaN(numericIsbn) ||
        !Number.isInteger(numericIsbn) ||
        modifiedIsbn.length > 13 ||
        numericIsbn < 0
      ) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json(errorResponse("INVALID_DATA", ["Invalid ISBN."]));
      }

      // Check if a book already has that ISBN
      const existingIsbn = await getBookByIsbn(modifiedIsbn);

      if (existingIsbn) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json(
            errorResponse(
              "ISBN_ALREADY_EXIST",
              "Book with this ISBN already exists."
            )
          );
      }
    }

    //* Publication Year
    // Check pub year validity
    const year = Number(pubYear);

    if (typeof pubYear === "boolean" || isNaN(year) || year < 0) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_DATA", ["Invalid publication year."]));
    }

    if (Number(pubYear) > getCurrentYear()) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(
          errorResponse("INVALID_DATA", [
            "Publication year cannot be in the future.",
          ])
        );
    }

    //* Quantity
    // Check quantity validity
    const parsedQuantity = Number(quantity);

    if (
      typeof quantity === "boolean" ||
      isNaN(parsedQuantity) ||
      parsedQuantity < 0 ||
      !Number.isInteger(parsedQuantity)
    ) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(
          errorResponse("INVALID_DATA", [
            parsedQuantity < 0
              ? "Quantity must be positive."
              : !Number.isInteger(parsedQuantity)
              ? "Quantity must be a whole number."
              : "Invalid quantity.",
          ])
        );
    }

    //* Price
    // Check price validity
    const parsedPrice = Number(price);

    if (typeof price === "boolean" || isNaN(parsedPrice) || parsedPrice < 0) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(
          errorResponse("INVALID_DATA", [
            parsedPrice < 0 ? "Price must be positive." : "Invalid price.",
          ])
        );
    }

    //* Authors
    // Check if authorIds is an array
    if (!Array.isArray(authorIds)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_DATA", ["Author IDs must be an array."]));
    }

    // Check if authorIds array contains author IDs
    if (authorIds.length === 0) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(
          errorResponse("INVALID_DATA", ["Author IDs array cannot be empty."])
        );
    }

    // Check if each authorId is a valid number
    for (let i = 0; i < authorIds.length; i++) {
      const authorId = Number(authorIds[i]);
      if (isNaN(authorId)) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json(
            errorResponse("INVALID_DATA", [
              "Each Author ID must be a valid number.",
            ])
          );
      }

      authorIds[i] = authorId;
    }

    // Check if authors exist
    for (const authorId of authorIds) {
      const author: Author = await getAuthorByIdQuery(authorId);
      if (!author) {
        return res
          .status(HttpStatusCode.NOT_FOUND)
          .json(errorResponse("NOT_FOUND", ["One or more authors not found."]));
      }
    }

    //* Genres
    // Check if genreIds is an array
    if (!Array.isArray(genreIds)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_DATA", ["Genre IDs must be an array."]));
    }

    // Check if genreIds array contains genre IDs
    if (genreIds.length === 0) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(
          errorResponse("INVALID_DATA", ["Genre IDs array cannot be empty."])
        );
    }

    // Check if each genreId is a valid number
    for (let i = 0; i < genreIds.length; i++) {
      const genreId = Number(genreIds[i]);
      if (isNaN(genreId)) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json(
            errorResponse("INVALID_DATA", [
              "Each Genre ID must be a valid number.",
            ])
          );
      }

      genreIds[i] = genreId;
    }

    // Check if genres exist
    for (const genreId of genreIds) {
      const genre: Genre = await getGenreByIdQuery(genreId);
      if (!genre) {
        return res
          .status(HttpStatusCode.NOT_FOUND)
          .json(errorResponse("NOT_FOUND", ["One or more genres not found."]));
      }
    }

    //* Create book and return book ID
    const bookId = await createNewBookQuery(
      title,
      isbn,
      pubYear,
      quantity,
      price
    );

    //* Book_Authors
    // Add authors in book_authors table
    if (Array.isArray(authorIds) && authorIds.length > 0) {
      // Remove duplicates
      const uniqueAuthorIds = Array.from(new Set(authorIds));

      // Delete all book_author existing records with book_id
      await deleteBookAuthorQuery(bookId);

      // Add the updated book_author records
      for (const authorId of uniqueAuthorIds) {
        await createNewBookAuthorQuery(bookId, Number(authorId));
      }
    }

    //* Book_Genres
    // Add genres in book_genres
    if (Array.isArray(genreIds) && genreIds.length > 0) {
      // Remove duplicates
      const uniqueGenreIds = Array.from(new Set(genreIds));

      // Delete all book_genre existing records with book_id
      await deleteBookGenreQuery(bookId);

      // Add the updated book_genre records
      for (const genreId of uniqueGenreIds) {
        await createNewBookGenreQuery(bookId, Number(genreId));
      }
    }

    return res
      .status(HttpStatusCode.CREATED)
      .json(successResponse("Book successfully created."));
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

    return res.json(
      successResponse("Book successfully retrieved.", {
        ...book,
        price: Number(book.price),
      })
    );
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

    //* Check ID
    // Return an error if id is not a valid number
    if (isNaN(id)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_ID", "Invalid book id."));
    }

    //* Get Book
    const book: Book = await getBookByIdQuery(id);

    //* Return an error if the book was not found
    if (!book) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json(errorResponse("NOT_FOUND", "Book not found."));
    }

    const getValidValue = (input: any, fallback: any) =>
      input === "" || input === null || input === undefined ? fallback : input;

    //* Get request body details
    //? To make any field required, just remove the existing book alternative. This doesn't apply to author and genre IDs
    const title = getValidValue(req.body.title, book.title);
    const isbn = getValidValue(req.body.isbn, book.isbn);
    const pubYear = getValidValue(req.body.pubYear, book.pub_year);
    const quantity = getValidValue(req.body.quantity, book.quantity);
    const price = getValidValue(req.body.price, book.price);

    // TODO: The user can enter the same authorId twice. Prevent it!
    const authorIds = req.body.authorIds;
    const genreIds = req.body.genreIds;

    //* Required Fields
    // Check for required fields
    const requiredFields = [
      { name: "Title", value: title },
      { name: "ISBN", value: isbn },
      { name: "Publication year", value: pubYear },
      { name: "Quantity", value: quantity },
      { name: "Price", value: price },
    ];

    for (const field of requiredFields) {
      if (!field.value) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json(errorResponse("INVALID_DATA", [`${field.name} is required.`]));
      }
    }

    //* ISBN
    if (isbn) {
      if (typeof isbn === "boolean") {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json(errorResponse("INVALID_DATA", ["Invalid ISBN."]));
      }

      const modifiedIsbn = removeDashesAndSpaces(String(isbn));
      const numericIsbn = Number(modifiedIsbn);

      if (
        isNaN(numericIsbn) ||
        !Number.isInteger(numericIsbn) ||
        modifiedIsbn.length > 13 ||
        numericIsbn < 0
      ) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json(errorResponse("INVALID_DATA", ["Invalid ISBN."]));
      }
    }

    //* Publication Year
    // Check pub year validity
    const year = Number(pubYear);

    if (typeof pubYear === "boolean" || isNaN(year) || year < 0) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_DATA", ["Invalid publication year."]));
    }

    if (Number(pubYear) > getCurrentYear()) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(
          errorResponse("INVALID_DATA", [
            "Publication year cannot be in the future.",
          ])
        );
    }

    //* Quantity
    // Check quantity validity
    const parsedQuantity = Number(quantity);

    if (
      typeof quantity === "boolean" ||
      isNaN(parsedQuantity) ||
      parsedQuantity < 0 ||
      !Number.isInteger(parsedQuantity)
    ) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(
          errorResponse("INVALID_DATA", [
            parsedQuantity < 0
              ? "Quantity must be positive."
              : !Number.isInteger(parsedQuantity)
              ? "Quantity must be a whole number."
              : "Invalid quantity.",
          ])
        );
    }

    //* Price
    // Check price validity
    const parsedPrice = Number(price);

    if (typeof price === "boolean" || isNaN(parsedPrice) || parsedPrice < 0) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(
          errorResponse("INVALID_DATA", [
            parsedPrice < 0 ? "Price must be positive." : "Invalid price.",
          ])
        );
    }

    //* Authors
    if (Array.isArray(authorIds) && authorIds.length > 0) {
      // Check if each authorId is a valid number
      for (let i = 0; i < authorIds.length; i++) {
        const authorId = Number(authorIds[i]);
        if (isNaN(authorId)) {
          return res
            .status(HttpStatusCode.BAD_REQUEST)
            .json(
              errorResponse("INVALID_DATA", [
                "Each Author ID must be a valid number.",
              ])
            );
        }

        authorIds[i] = authorId;
      }

      // Check if authors exist
      for (const authorId of authorIds) {
        const author: Author = await getAuthorByIdQuery(authorId);

        if (!author) {
          return res
            .status(HttpStatusCode.NOT_FOUND)
            .json(errorResponse("NOT_FOUND", "Author not found."));
        }
      }
    }

    //* Genres
    // Check if genres exist
    if (Array.isArray(genreIds) && genreIds.length > 0) {
      // Check if each genreId is a valid number
      for (let i = 0; i < genreIds.length; i++) {
        const genreId = Number(genreIds[i]);
        if (isNaN(genreId)) {
          return res
            .status(HttpStatusCode.BAD_REQUEST)
            .json(
              errorResponse("INVALID_DATA", [
                "Each Genre ID must be a valid number.",
              ])
            );
        }

        genreIds[i] = genreId;
      }

      for (const genreId of genreIds) {
        const genre: Genre = await getGenreByIdQuery(genreId);

        if (!genre) {
          return res
            .status(HttpStatusCode.NOT_FOUND)
            .json(errorResponse("NOT_FOUND", "Genre not found."));
        }
      }
    }

    //* Update book
    await updateBookByIdQuery(title, isbn, pubYear, quantity, price, id);

    //* Book_Authors
    // Update authors in book_authors table
    if (Array.isArray(authorIds) && authorIds.length > 0) {
      // Remove duplicates
      const uniqueAuthorIds = Array.from(new Set(authorIds));

      // Delete all book_author existing records with book_id
      await deleteBookAuthorQuery(book.id);

      // Add the updated book_author records
      for (const authorId of uniqueAuthorIds) {
        await createNewBookAuthorQuery(id, Number(authorId));
      }
    }

    //* Book_Genres
    // Update genres in book_genres
    if (Array.isArray(genreIds) && genreIds.length > 0) {
      // Remove duplicates
      const uniqueGenreIds = Array.from(new Set(genreIds));

      // Delete all book_genre existing records with book_id
      await deleteBookGenreQuery(book.id);

      // Add the updated book_genre records
      for (const genreId of uniqueGenreIds) {
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
