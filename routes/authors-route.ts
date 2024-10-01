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

// Get all authors - GET {/authors}/
authorsRouter.get("/", getAllAuthors);

// Get a single author - GET {/authors}/:id
authorsRouter.get("/:id", getAuthor);

// Create a new author - POST {/authors}/
authorsRouter.post("/", createAuthor);

// Update a single author - PUT {/authors}/:id
authorsRouter.put("/:id", updateAuthor);

// Delete a single author - DELETE {/authors}/:id
authorsRouter.delete("/:id", deleteAuthor);

export default authorsRouter;
