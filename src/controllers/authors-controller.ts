// External Imports
import { RequestHandler } from "express";

// Local Imports
import { Author, HttpStatusCode } from "../../types/shared-types";
import { HttpError } from "../interfaces/httpError";
import { getAllAuthorsQuery } from "../lib/authors";
import { successResponse } from "../utils/api-response";

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
