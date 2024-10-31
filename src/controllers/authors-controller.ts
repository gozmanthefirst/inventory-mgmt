// External Imports
import { RequestHandler } from "express";

// Local Imports
import { Author, HttpStatusCode } from "../../types";
import { HttpError } from "../interfaces/httpError";
import {
  createNewAuthorQuery,
  deleteAuthorByIdQuery,
  getAllAuthorsQuery,
  getAuthorByIdQuery,
  updateAuthorByIdQuery,
} from "../lib/authors";
import { errorResponse, successResponse } from "../utils/api-response";

/**
 * Gets all the authors
 * @route GET /
 */
export const getAllAuthors: RequestHandler = async (req, res, next) => {
  try {
    const authors: Author[] = await getAllAuthorsQuery();
    return res.json(
      successResponse("Authors successfully retrieved.", authors)
    );
  } catch (error) {
    (error as HttpError).status = HttpStatusCode.INTERNAL_SERVER_ERROR;
    return next(error);
  }
};

/**
 * Creates a new author
 * @route POST /
 */
export const createAuthor: RequestHandler = async (req, res, next) => {
  try {
    const { name, bio } = req.body;

    //* Required Fields
    // Check for required fields
    const requiredFields = [{ name: "Name", value: name }];

    for (const field of requiredFields) {
      if (!field.value) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json(errorResponse("INVALID_DATA", [`${field.name} is required.`]));
      }
    }

    await createNewAuthorQuery(name, bio);
    
    return res
      .status(HttpStatusCode.CREATED)
      .json(successResponse("Author successfully created."));
  } catch (error) {
    (error as HttpError).status = HttpStatusCode.INTERNAL_SERVER_ERROR;
    return next(error);
  }
};

/**
 * Gets a single author
 * @route GET /:id
 */
export const getAuthor: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // Return an error if id is not a valid number
    if (typeof id !== "number" || isNaN(id)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_ID", "Invalid author id."));
    }

    const author: Author = await getAuthorByIdQuery(id);

    // Return an error if the author was not found
    if (!author) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json(errorResponse("NOT_FOUND", "Author not found."));
    }

    return res.json(successResponse("Author successfully retrieved.", author));
  } catch (error) {
    (error as HttpError).status = HttpStatusCode.INTERNAL_SERVER_ERROR;
    return next(error);
  }
};

/**
 * Updates a single author
 * @route PUT /:id
 */
export const updateAuthor: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    //* Check ID
    // Return an error if id is not a valid number
    if (typeof id !== "number" || isNaN(id)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_ID", "Invalid author id."));
    }

    //* Get Author
    const author: Author = await getAuthorByIdQuery(id);

    //* Return an error if the author was not found
    if (!author) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json(errorResponse("NOT_FOUND", "Author not found."));
    }

    const getValidValue = (input: any, fallback: any) =>
      input === "" || input === null || input === undefined ? fallback : input;

    //* Get request body details
    //? To make any field required, just remove the existing author alternative.
    const name = getValidValue(req.body.name, author.name);
    const bio = getValidValue(req.body.bio, author.bio);

    //* Required Fields
    // Check for required fields
    const requiredFields = [{ name: "Name", value: name }];

    for (const field of requiredFields) {
      if (!field.value) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json(errorResponse("INVALID_DATA", [`${field.name} is required.`]));
      }
    }

    await updateAuthorByIdQuery(name, bio, id);

    return res.json(successResponse("Author successfully updated."));
  } catch (error) {
    (error as HttpError).status = HttpStatusCode.INTERNAL_SERVER_ERROR;
    return next(error);
  }
};

/**
 * Deletes a single author
 * @route DELETE /:id
 */
export const deleteAuthor: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // Return an error if id is not a valid number
    if (typeof id !== "number" || isNaN(id)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_ID", "Invalid author id."));
    }

    const author: Author = await getAuthorByIdQuery(id);

    // Return an error if the author was not found
    if (!author) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json(errorResponse("NOT_FOUND", "Author not found."));
    }

    await deleteAuthorByIdQuery(id);

    return res.json(successResponse("Author successfully deleted."));
  } catch (error) {
    (error as HttpError).status = HttpStatusCode.INTERNAL_SERVER_ERROR;
    return next(error);
  }
};
