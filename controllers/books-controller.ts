import { RequestHandler } from "express";

/**
 * Gets all the books
 * @route GET /
 */
export const getAllBooks: RequestHandler = async (req, res, next) => {};

/**
 * Gets a single book
 * @route GET /:id
 */
export const getBook: RequestHandler = async (req, res, next) => {};

/**
 * Creates a new book
 * @route POST /
 */
export const createBook: RequestHandler = async (req, res, next) => {};

/**
 * Updates a single book
 * @route POST /:id
 */
export const updateBook: RequestHandler = async (req, res, next) => {};

/**
 * Deletes a single book
 * @route DELETE /:id
 */
export const deleteBook: RequestHandler = async (req, res, next) => {};
