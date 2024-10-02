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

// Get all authors - GET {/api/authors}/
authorsRouter.get("/", getAllAuthors);

// Get a single author - GET {/api/authors}/:id
authorsRouter.get("/:id", getAuthor);

// Create a new author - POST {/api/authors}/
authorsRouter.post("/", createAuthor);

// Update a single author - PUT {/api/authors}/:id
authorsRouter.put("/:id", updateAuthor);

// Delete a single author - DELETE {/api/authors}/:id
authorsRouter.delete("/:id", deleteAuthor);

export default authorsRouter;
