// External Imports
import axios from "axios";
import dotenv from "dotenv";

// Local Import
import { GoogleBookResponse } from "../../types/google-books";

dotenv.config();

const API_BASE = "https://www.googleapis.com/books/v1/volumes";

export const searchBooks = async (query: string) => {
  try {
    const response = await axios.get<GoogleBookResponse>(API_BASE, {
      params: {
        q: query,
        key: process.env.GOOGLE_BOOKS_API_KEY,
        hl: "en",
        langRestrict: "en",
      },
    });

    return response.data.items || [];
  } catch (error) {
    console.error("Google Books API error:", error);
    throw new Error("Failed to fetch books");
  }
};
