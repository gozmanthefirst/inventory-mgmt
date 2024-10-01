import { RequestHandler } from "express";

/**
 * Gets all the genres
 * @route GET /
 */
export const getAllGenres: RequestHandler = async (req, res, next) => {};

/**
 * Gets a single genre
 * @route GET /:id
 */
export const getGenre: RequestHandler = async (req, res, next) => {};
