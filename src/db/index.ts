import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Create the connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

// Create the drizzle instance with camelCase to snake_case mapping
export const db = drizzle(client, { schema, casing: 'snake_case' });

// Export the client for migrations
export { client };
