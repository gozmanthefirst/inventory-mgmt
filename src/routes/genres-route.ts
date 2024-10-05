// External Imports
import { Router } from "express";

// local Imports
import {
  createGenre,
  deleteGenre,
  getAllGenres,
  getGenre,
  updateGenre,
} from "../controllers/genres-controller";

// Local Imports

// Initialize router
const genresRouter = Router();

// Get all genres - GET {/api/v1/genres}/
genresRouter.get("/", getAllGenres);

// Create a new genre - POST {/api/v1/genres}/
genresRouter.post("/", createGenre);

// Get a single genre - GET {/api/v1/genres}/:id
genresRouter.get("/:id", getGenre);

// Update a single genre - PUT {/api/v1/genres}/:id
genresRouter.put("/:id", updateGenre);

// Delete a single genre - DELETE {/api/v1/genres}/:id
genresRouter.delete("/:id", deleteGenre);

export default genresRouter;
