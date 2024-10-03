// External Imports
import { ErrorRequestHandler } from "express";

// Local Imports
import { HttpError } from "../interfaces/httpError";
import { errorResponse } from "../utils/api-response";

/**
 * Handles all errors thrown in the app.
 */
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status ?? 500)
    .json(
      err.status === 500
        ? errorResponse("SERVER_ERROR", "Internal Server Error")
        : errorResponse((err as HttpError)?.code!, (err as HttpError)?.details!)
    );
};

export default errorHandler;
