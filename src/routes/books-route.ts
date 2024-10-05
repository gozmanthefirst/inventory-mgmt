// External Imports
import { Router } from "express";

// Local Imports
import {
  createBook,
  deleteBook,
  getAllBooks,
  getBook,
  updateBook,
} from "../controllers/books-controller";

// Local Imports

// Initialize router
const booksRouter = Router();

// Get all books - GET {/api/v1/books}/
booksRouter.get("/", getAllBooks);

// Create a new book - POST {/api/v1/books}/
booksRouter.post("/", createBook);

// Get a single book - GET {/api/v1/books}/:id
booksRouter.get("/:id", getBook);

// Update a single book - PUT {/api/v1/books}/:id
booksRouter.put("/:id", updateBook);

// Delete a single book - DELETE {/api/v1/books}/:id
booksRouter.delete("/", deleteBook);

export default booksRouter;
