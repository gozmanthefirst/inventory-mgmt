// External Imports
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { Client } from "pg";

dotenv.config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL environment variable is missing.");
}

const createTablesSqlQuery = fs.readFileSync(
  path.join(__dirname, "../../sql/create-tables.sql"),
  "utf8"
);

const main = async () => {
  console.log("Seeding the database...");

  const client = new Client({
    connectionString: dbUrl,
  });

  try {
    await client.connect();
    console.log("Connected to the database.");

    await client.query(createTablesSqlQuery);
    console.log("Necessary tables created.");
  } catch (error) {
    console.error("Error during database operation:", error);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
};

main();
