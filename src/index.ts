// External Imports
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

// Local Imports
import errorHandler from "./middleware/error";
import logger from "./middleware/logger";
import notFound from "./middleware/not-found";
import authorsRouter from "./routes/authors-route";
import booksRouter from "./routes/books-route";
import genresRouter from "./routes/genres-route";

dotenv.config();

const PORT = process.env.PORT || 8000;

// Initialize Express app
const app = express();

// CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3000"],
    credentials: true,
  })
);

// Response compression and Cookie parser
app.use(compression());
app.use(cookieParser());

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger Middlewaare
app.use(logger);

// Routes
app.use("/api/v1/books", booksRouter);
app.use("/api/v1/authors", authorsRouter);
app.use("/api/v1/genres", genresRouter);

// Not Found Routes
app.use(notFound);

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost/${PORT}`);
});
