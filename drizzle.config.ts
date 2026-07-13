import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL_UNPOOLED;

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/db/schema.ts",
  out: "./server/db/migrations",
  dbCredentials: databaseUrl
    ? { url: databaseUrl }
    : { url: "postgresql://placeholder:placeholder@localhost:5432/nextory11" },
  strict: true,
  verbose: true,
});
