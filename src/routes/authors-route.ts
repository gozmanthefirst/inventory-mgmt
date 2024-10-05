// External Imports
import { Router } from "express";

// Local Imports
import {
  createAuthor,
  deleteAuthor,
  getAllAuthors,
  getAuthor,
  updateAuthor,
} from "../controllers/authors-controller";

// Initialize router
const authorsRouter = Router();

// Get all authors - GET {/api/v1/authors}/
authorsRouter.get("/", getAllAuthors);

// Create a new author - POST {/api/v1/authors}/
authorsRouter.post("/", createAuthor);

// Get a single author - GET {/api/v1/authors}/:id
authorsRouter.get("/:id", getAuthor);

// Update a single author - PUT {/api/v1/authors}/:id
authorsRouter.put("/:id", updateAuthor);

// Delete a single author - DELETE {/api/v1/authors}/:id
authorsRouter.delete("/:id", deleteAuthor);

export default authorsRouter;
