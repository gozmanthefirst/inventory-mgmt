// External Imports
import { Router } from "express";

// Local Imports
import { getAllAuthors } from "../controllers/authors-controller";

// Initialize router
const authorsRouter = Router();

// Get all authors - GET {/api/v1/authors}/
authorsRouter.get("/", getAllAuthors);

export default authorsRouter;
