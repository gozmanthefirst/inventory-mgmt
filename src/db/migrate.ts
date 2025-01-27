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

//* Create Tables
const createTablesSqlQuery = fs.readFileSync(
  path.join(__dirname, "../../../sql/create-tables.sql"),
  "utf8"
);

const createTables = async () => {
  console.log("Creating database tables...");

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

// createTables();

//* Drop Tables
const dropTablesSqlQuery = fs.readFileSync(
  path.join(__dirname, "../../../sql/drop-tables.sql"),
  "utf8"
);

const dropTables = async () => {
  console.log("dropping database tables...");

  const client = new Client({
    connectionString: dbUrl,
  });

  try {
    await client.connect();
    console.log("Connected to the database.");

    await client.query(dropTablesSqlQuery);
    console.log("Tables dropped.");
  } catch (error) {
    console.error("Error during database operation:", error);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
};

// dropTables();
// createTables();

//* Alter Tables
const alterTablesSqlQuery = fs.readFileSync(
  path.join(__dirname, "../../../sql/alter-tables.sql"),
  "utf8"
);

const alterTables = async () => {
  console.log("Altering database tables...");

  const client = new Client({
    connectionString: dbUrl,
  });

  try {
    await client.connect();
    console.log("Connected to the database.");

    await client.query(alterTablesSqlQuery);
    console.log("Necessary tables and columns altered.");
  } catch (error) {
    console.error("Error during database operation:", error);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
};

// alterTables();
