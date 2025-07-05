import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	out: "./src/db/migrations",
	schema: "./src/db/schema/*",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
	// Print all statements
	verbose: true,
	// Always ask for confirmation
	strict: true,
});
