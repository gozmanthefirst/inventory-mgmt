// External Imports
import { Router } from "express";

// local Imports
import { getAllGenres, getGenre } from "../controllers/genres-controller";

// Local Imports

// Initialize router
const genresRouter = Router();

// Get all genres - GET {/genres}/
genresRouter.get("/", getAllGenres);

// Get a single genre - GET {/genres}/:id
genresRouter.get("/:id", getGenre);

export default genresRouter;
