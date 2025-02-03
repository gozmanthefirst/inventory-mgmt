// External Imports
import { Router } from "express";

// Local Imports
import {
  createBook,
  deleteBook,
  getAllBooks,
  getBook,
  searchBook,
} from "../controllers/books-controller";

// Local Imports

// Initialize router
const booksRouter = Router();

// Get all books - GET {/api/v1/books}/
booksRouter.get("/", getAllBooks);

// Create a new book - POST {/api/v1/books}/
booksRouter.post("/", createBook);

// Search for a book - GET {/api/v1/books}/search
booksRouter.get("/search", searchBook);

// Get a single book - GET {/api/v1/books}/:id
booksRouter.get("/:id", getBook);

// Delete a single book - DELETE {/api/v1/books}/:id
booksRouter.delete("/:id", deleteBook);

export default booksRouter;
