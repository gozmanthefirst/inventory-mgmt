// External Imports
import { Router } from "express";

// local Imports
import { getAllGenres } from "../controllers/genres-controller";

// Initialize router
const genresRouter = Router();

// Get all genres - GET {/api/v1/genres}/
genresRouter.get("/", getAllGenres);

export default genresRouter;
