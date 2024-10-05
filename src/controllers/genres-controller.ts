// External Imports
import { RequestHandler } from "express";

// Local Imports
import { Genre, HttpStatusCode } from "../../types";
import { HttpError } from "../interfaces/httpError";
import {
  createNewGenreQuery,
  deleteGenreByIdQuery,
  getAllGenresQuery,
  getGenreByIdQuery,
  updateGenreByIdQuery,
} from "../lib/genres";
import { errorResponse, successResponse } from "../utils/api-response";

/**
 * Gets all the genres
 * @route GET /
 */
export const getAllGenres: RequestHandler = async (req, res, next) => {
  try {
    const genres: Genre[] = await getAllGenresQuery();
    return res.json(successResponse("Genres successfully retrieved.", genres));
  } catch (error) {
    (error as HttpError).status = HttpStatusCode.INTERNAL_SERVER_ERROR;
    return next(error);
  }
};

/**
 * Creates a new genre
 * @route POST /
 */
export const createGenre: RequestHandler = async (req, res, next) => {
  try {
    const { name } = req.body;

    await createNewGenreQuery(name);
    return res.json(successResponse("Genre successfully created."));
  } catch (error) {
    (error as HttpError).status = HttpStatusCode.INTERNAL_SERVER_ERROR;
    return next(error);
  }
};

/**
 * Gets a single genre
 * @route GET /:id
 */
export const getGenre: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // Return an error if id is not a valid number
    if (typeof id !== "number" || isNaN(id)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_ID", "Invalid genre id."));
    }

    const genre: Genre = await getGenreByIdQuery(id);

    // Return an error if the genre was not found
    if (!genre) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json(errorResponse("NOT_FOUND", "Genre not found."));
    }

    return res.json(successResponse("Genre successfully retrieved.", genre));
  } catch (error) {
    (error as HttpError).status = HttpStatusCode.INTERNAL_SERVER_ERROR;
    return next(error);
  }
};

/**
 * Updates a single genre
 * @route PUT /:id
 */
export const updateGenre: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;

    // Return an error if id is not a valid number
    if (typeof id !== "number" || isNaN(id)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_ID", "Invalid genre id."));
    }

    const genre: Genre = await getGenreByIdQuery(id);

    // Return an error if the genre was not found
    if (!genre) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json(errorResponse("NOT_FOUND", "Genre not found."));
    }

    // Return an error if there's no name
    if (!name) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_DATA", ["Name is required."]));
    }

    await updateGenreByIdQuery(name ? name : genre.name, id);

    return res.json(successResponse("Genre successfully updated."));
  } catch (error) {
    (error as HttpError).status = HttpStatusCode.INTERNAL_SERVER_ERROR;
    return next(error);
  }
};

/**
 * Deletes a single genre
 * @route DELETE /:id
 */
export const deleteGenre: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // Return an error if id is not a valid number
    if (typeof id !== "number" || isNaN(id)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json(errorResponse("INVALID_ID", "Invalid genre id."));
    }

    const genre: Genre = await getGenreByIdQuery(id);

    // Return an error if the genre was not found
    if (!genre) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json(errorResponse("NOT_FOUND", "Genre not found."));
    }

    await deleteGenreByIdQuery(id);

    return res.json(successResponse("Genre successfully deleted."));
  } catch (error) {
    (error as HttpError).status = HttpStatusCode.INTERNAL_SERVER_ERROR;
    return next(error);
  }
};
