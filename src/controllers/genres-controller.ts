// External Imports
import { Genre } from "@prisma/client";
import { RequestHandler } from "express";

// Local Imports
import { HttpStatusCode } from "../../types/shared-types";
import { HttpError } from "../interfaces/httpError";
import { getAllGenresQ } from "../lib/genres";
import { successResponse } from "../utils/api-response";

/**
 * Gets all the genres
 * @route GET /
 */
export const getAllGenres: RequestHandler = async (req, res, next) => {
  try {
    const genres: Genre[] = await getAllGenresQ();
    return res.json(successResponse("Genres successfully retrieved.", genres));
  } catch (error) {
    (error as HttpError).status = HttpStatusCode.INTERNAL_SERVER_ERROR;
    return next(error);
  }
};
