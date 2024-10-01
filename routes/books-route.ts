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

// Get all books - GET {/books}/
booksRouter.get("/", getAllBooks);

// Get a single book - GET {/books}/:id
booksRouter.get("/:id", getBook);

// Create a new book - POST {/books}/
booksRouter.post("/", createBook);

// Update a single book - PUT {/books}/:id
booksRouter.put("/:id", updateBook);

// Delete a single book - DELETE {/books}/:id
booksRouter.delete("/", deleteBook);

export default booksRouter;
