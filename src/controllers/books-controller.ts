// External Imports
import { RequestHandler } from "express";

// Local Imports
import { BookSearchResult } from "../../types/google-books";
import { Author, Book, Genre, HttpStatusCode } from "../../types/shared-types";
import { HttpError } from "../interfaces/httpError";
import {
  createNewAuthorQuery,
  deleteAuthorByIdQuery,
  getAuthorByNameQuery,
} from "../lib/authors";
import {
  createNewBookAuthorQuery,
  getAuthorIdByBookIdQuery,
  getBookIdByAuthorIdQuery,
} from "../lib/book-authors";
import {
  createNewBookGenreQuery,
  getBookIdByGenreIdQuery,
  getGenreIdByBookIdQuery,
} from "../lib/book-genres";
import {
  createNewBookQuery,
  deleteBookByIdQuery,
  getAllBooksQuery,
  getBookByIdQuery,
  getBookByIsbn,
} from "../lib/books";
import {
  createNewGenreQuery,
  deleteGenreByIdQuery,
  getGenreByNameQuery,
} from "../lib/genres";
import { searchBooks } from "../services/google-books";
import { errorResponse, successResponse } from "../utils/api-response";
import { isValidPastDate } from "../utils/datetime";
import { removeDashesAndSpaces } from "../utils/string";

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
    const {
      title,
      subtitle,
      bookDesc,
      imageUrl,
      isbn,
      publisher,
      publishedDate,
      pageCount,
      authors,
      genres,
    } = req.body;

    //* Required Fields
    // Check for required fields
    const requiredFields = [
      { name: "Title", value: title },
      { name: "ISBN", value: isbn },
      { name: "Publisher", value: publisher },
      { name: "Published Date", value: publishedDate },
      { name: "Page Count", value: pageCount },
      { name: "Author(s)", value: authors },
      { name: "Genre(s)", value: genres },
    ];

    for (const field of requiredFields) {
      if (!field.value) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json(errorResponse("INVALID_DATA", [`${field.name} is required.`]));
      }
    }

    //* Title
    if (typeof title !== "string" || title.length < 1) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_DATA", ["Title can not be blank."]));
    }

    //* ISBN
    // Return error if isbn is a boolean
    if (typeof isbn === "boolean") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_DATA", ["Invalid ISBN."]));
    }

    // This formatting is necessary incase the ISBN is in the form of groups of numbers separated by dashes.
    const modifiedIsbn = removeDashesAndSpaces(String(isbn));

    if (modifiedIsbn.length !== 13 && modifiedIsbn.length !== 10) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_DATA", ["Invalid ISBN."]));
    }

    let isIsbnValid = false;

    // ISBN-10: 10 chars, first 9 are digits, last can be digit or 'X'
    if (modifiedIsbn.length === 10) {
      isIsbnValid = /^\d{9}[\dXx]$/.test(modifiedIsbn);
    }

    // ISBN-13: 13 digits only
    if (modifiedIsbn.length === 13) {
      isIsbnValid = /^\d{13}$/.test(modifiedIsbn);
    }

    if (!isIsbnValid) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(
          errorResponse("INVALID_DATA", ["ISBN contains invalid characters."])
        );
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

    //* Published Date
    // Check published date validity
    const validPubdate = isValidPastDate(publishedDate);

    if (!validPubdate) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_DATA", ["Invalid publication year."]));
    }

    //* Page Count
    if (isNaN(Number(pageCount)) || Number(pageCount) <= 0) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_DATA", ["Invalid page count."]));
    }

    //* Authors
    // Check if authors is an array
    if (!Array.isArray(authors)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_DATA", ["Authors must be an array."]));
    }

    // Check if authors array contains authors
    if (authors.length === 0) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(
          errorResponse("INVALID_DATA", ["Authors array cannot be empty."])
        );
    }

    // Check if each author is a valid string
    for (let i = 0; i < authors.length; i++) {
      const author = authors[i];
      if (typeof author !== "string") {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json(
            errorResponse("INVALID_DATA", [
              "Each Author must be a valid string.",
            ])
          );
      }
      if (typeof author === "string" && author.length === 0) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json(
            errorResponse("INVALID_DATA", ["Author cannot be an empty string."])
          );
      }

      authors[i] = author;
    }

    //* Genres
    // Check if genres is an array
    if (!Array.isArray(genres)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_DATA", ["Genres must be an array."]));
    }

    // Check if genres array contains genres
    if (genres.length === 0) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_DATA", ["Genres array cannot be empty."]));
    }

    // Check if each genre is a valid string
    for (let i = 0; i < genres.length; i++) {
      const genre = genres[i];
      if (typeof genre !== "string") {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json(
            errorResponse("INVALID_DATA", [
              "Each Genre must be a valid string.",
            ])
          );
      }
      if (typeof genre === "string" && genre.length === 0) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json(
            errorResponse("INVALID_DATA", ["Genre cannot be an empty string."])
          );
      }

      genres[i] = genre;
    }

    // Optional fields
    const finalSubtitle = subtitle ? subtitle : "";
    const finalBookDesc = bookDesc ? bookDesc : "";
    const finalImageUrl = imageUrl ? imageUrl : "";
    const finalPubDate = new Date(publishedDate);

    //* Create book and return book ID
    //! Turn the argument into an object. Easier to work with that way!
    const bookId = await createNewBookQuery(
      title,
      modifiedIsbn,
      publisher,
      finalPubDate,
      pageCount,
      finalSubtitle,
      finalBookDesc,
      finalImageUrl
    );

    // Add the book-author relationship in the join table
    for (const authorName of authors) {
      const author: Author = await getAuthorByNameQuery(authorName);

      let authorId: number;

      // Check if author's name already exist
      if (!author) {
        // If there's no existing author, make a request to add Author's name to authors table and return the ID.
        authorId = await createNewAuthorQuery(authorName);
      } else {
        // If there's an existing author, get the ID of the already existing author.
        authorId = author.id;
      }

      await createNewBookAuthorQuery(bookId, authorId);
    }

    // Add the book-genre relationship in the join table
    for (const genreName of genres) {
      const genre: Genre = await getGenreByNameQuery(genreName);

      let genreId: number;

      // Check if genre's name already exist
      if (!genre) {
        // If there's no existing genre, make a request to add Genre's name to genres table and return the ID.
        genreId = await createNewGenreQuery(genreName);
      } else {
        // If there's an existing genre, get the ID of the already existing genre.
        genreId = genre.id;
      }

      await createNewBookGenreQuery(bookId, genreId);
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
 * Search for a book
 * @route GET /search
 */
export const searchBook: RequestHandler = async (req, res, next) => {
  try {
    const query = req.query.q as string;

    if (!query) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("MISSING_QUERY", "Search query is required."));
    }

    let result = await searchBooks(query);

    const formattedResult: BookSearchResult[] = result.map((book) => {
      const formattedBook = {
        id: book.id,
        title: book.volumeInfo.title,
        subtitle: book.volumeInfo.subtitle || "",
        authors: book.volumeInfo.authors,
        description: book.volumeInfo.description || "",
        publisher: book.volumeInfo.publisher,
        publishedDate: book.volumeInfo.publishedDate,
        isbn10:
          book.volumeInfo.industryIdentifiers.find(
            (identifier) => identifier.type === "ISBN_10"
          )?.identifier || "",
        isbn13:
          book.volumeInfo.industryIdentifiers.find(
            (identifier) => identifier.type === "ISBN_13"
          )?.identifier || "",
        pageCount: book.volumeInfo.pageCount,
        categories: book.volumeInfo.categories,
        image: book.volumeInfo.imageLinks?.thumbnail || "",
      };

      return formattedBook;
    });

    const finalResult = formattedResult.filter((book) => book.pageCount > 0);

    return res.json(
      successResponse("Book search results gotten.", finalResult)
    );
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

    // Get the ID(s) of the author(s) of the book
    const bookAuthorsIds = await getAuthorIdByBookIdQuery(book.id);

    // Get the ID(s) of the genre(s) of the book
    const bookGenresIds = await getGenreIdByBookIdQuery(book.id);

    // Delete book
    await deleteBookByIdQuery(id);

    // Check if the authors of the deleted book have any other book
    bookAuthorsIds.forEach(async (item) => {
      const authorId = Number(item.author_id);
      const bookIds = await getBookIdByAuthorIdQuery(authorId);

      // If the author doesn't have any other book, delete them from the author table
      if (bookIds.length === 0) {
        await deleteAuthorByIdQuery(authorId);
      }
    });

    // Check if the genres of the deleted book have any other book
    bookGenresIds.forEach(async (item) => {
      const genreId = Number(item.genre_id);
      const bookIds = await getBookIdByGenreIdQuery(genreId);

      // If the genre doesn't have any other book, delete them from the genre table
      if (bookIds.length === 0) {
        await deleteGenreByIdQuery(genreId);
      }
    });

    return res.json(successResponse("Book successfully deleted."));
  } catch (error) {
    (error as HttpError).status = HttpStatusCode.INTERNAL_SERVER_ERROR;
    return next(error);
  }
};
