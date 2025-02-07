// External Imports
import { Book } from "@prisma/client";
import { RequestHandler } from "express";

// Local Imports
import { HttpStatusCode } from "../../types/shared-types";
import { HttpError } from "../interfaces/httpError";
import { deleteOrphanedAuthors } from "../lib/authors";
import {
  createNewBookQ,
  deleteBookByIdQ,
  getAllBooksQ,
  getBookByIdQ,
  getBookByIsbnQ,
} from "../lib/books";
import { deleteOrphanedGenres } from "../lib/genres";
import { errorResponse, successResponse } from "../utils/api-response";
import { isValidPastDate } from "../utils/datetime";
import { removeDashesAndSpaces } from "../utils/string";

/**
 * Gets all the books
 * @route GET /
 */
export const getAllBooks: RequestHandler = async (req, res, next) => {
  try {
    const books: Book[] = await getAllBooksQ();
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
    const existingIsbn = await getBookByIsbnQ(modifiedIsbn);

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
    await createNewBookQ({
      title,
      subtitle: finalSubtitle,
      bookDesc: finalBookDesc,
      imageUrl: finalImageUrl,
      isbn: modifiedIsbn,
      publisher,
      publishedDate: finalPubDate,
      pageCount,
      authors,
      genres,
    });

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
    const id = `${req.params.id}`;

    const book = await getBookByIdQ(id);

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
    const id = `${req.params.id}`;

    const book = await getBookByIdQ(id);

    // Return an error if the book was not found
    if (!book) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json(errorResponse("NOT_FOUND", "Book not found."));
    }

    // Delete book
    await deleteBookByIdQ(id);

    // Delete authors and genres if they no longer have a connected book
    await deleteOrphanedAuthors();
    await deleteOrphanedGenres();

    return res.json(successResponse("Book successfully deleted."));
  } catch (error) {
    (error as HttpError).status = HttpStatusCode.INTERNAL_SERVER_ERROR;
    return next(error);
  }
};
