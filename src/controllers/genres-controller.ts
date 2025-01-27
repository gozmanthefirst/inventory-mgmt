// External Imports
import { RequestHandler } from "express";

// Local Imports
import { HttpError } from "../interfaces/httpError";
import { getAllGenresQuery } from "../lib/genres";
import { successResponse } from "../utils/api-response";
import { Genre, HttpStatusCode } from "../../types";

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
