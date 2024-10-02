import { RequestHandler } from "express";

/**
 * Gets all the authors
 * @route GET /
 */
export const getAllAuthors: RequestHandler = async (req, res, next) => {};

/**
 * Gets a single author
 * @route GET /:id
 */
export const getAuthor: RequestHandler = async (req, res, next) => {};

/**
 * Creates a new author
 * @route POST /
 */
export const createAuthor: RequestHandler = async (req, res, next) => {};

/**
 * Updates a single author
 * @route POST /:id
 */
export const updateAuthor: RequestHandler = async (req, res, next) => {};

/**
 * Deletes a single author
 * @route DELETE /:id
 */
export const deleteAuthor: RequestHandler = async (req, res, next) => {};
