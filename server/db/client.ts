import { Pool } from "@neondatabase/serverless";
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import { getServerEnv } from "../config/env.js";
import * as schema from "./schema.js";

export type Database = NeonDatabase<typeof schema>;

let database: Database | undefined;
let pool: Pool | undefined;

export function getDatabase(): Database {
  if (!database) {
    pool = new Pool({ connectionString: getServerEnv().DATABASE_URL });
    database = drizzle(pool, { schema });
  }

  return database;
}
