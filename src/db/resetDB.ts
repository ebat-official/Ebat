import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import { db, client } from "./index";
import * as schema from "./schema";

// Reset mode: 'delete' only deletes data, 'drop' drops all tables completely
type ResetMode = "delete" | "drop";

// Reset options
type ResetOptions = {
	dry?: boolean; // If true, only logs what would be done without actually making changes
};

/**
 * Resets the database based on the specified mode
 * @param mode 'delete' to only delete data, 'drop' to drop all tables including drizzle migrations
 * @param options Additional options including dry run mode
 */
export async function resetDatabase(
	mode: ResetMode = "delete",
	options: ResetOptions = {},
): Promise<void> {
	const isDryRun = options.dry === true;
	const dryRunPrefix = isDryRun ? "[DRY RUN] Would" : "Will";

	console.warn(`${dryRunPrefix} start database reset in '${mode}' mode...`);

	try {
		if (mode === "delete") {
			await deleteAllData(db, isDryRun);
			console.log(
				`${isDryRun ? "[DRY RUN] Would have deleted" : "Successfully deleted"} all data from tables`,
			);
		} else if (mode === "drop") {
			await dropAllTables(db, isDryRun);
			console.log(
				`${isDryRun ? "[DRY RUN] Would have dropped" : "Successfully dropped"} all tables including drizzle migrations`,
			);
		} else {
			throw new Error(
				`Invalid reset mode: ${mode}. Must be 'delete' or 'drop'.`,
			);
		}

		console.log(
			`Database reset ${isDryRun ? "dry run" : "operation"} completed successfully`,
		);
	} catch (error) {
		console.error("Error resetting database:", error);
		throw error;
	}
}

/**
 * Deletes all data from all tables without dropping the tables
 * @param db Database instance
 * @param isDryRun If true, only logs what would be done without actually making changes
 */
async function deleteAllData(
	db: PostgresJsDatabase<typeof schema>,
	isDryRun = false,
): Promise<void> {
	// Get all tables from the schema
	const tables = Object.values(schema).filter(
		(item) =>
			typeof item === "object" &&
			item !== null &&
			"name" in item &&
			typeof item.name === "string",
	);

	console.log(`Found ${tables.length} tables to clear data from`);

	// Process tables in reverse to handle dependencies
	// This approach tries to handle foreign key constraints by starting with tables that are referenced by others
	for (const table of tables) {
		try {
			const tableName = (table as { name: string }).name;
			console.log(
				`${isDryRun ? "[DRY RUN] Would delete" : "Deleting"} data from table: ${tableName}`,
			);

			if (!isDryRun) {
				await db.delete(table as Parameters<typeof db.delete>[0]);
			}
		} catch (error) {
			console.error(
				`Error with table ${(table as { name: string }).name}:`,
				error,
			);
			// Continue with other tables even if one fails
		}
	}
}

/**
 * Drops all tables including the drizzle migrations table
 * @param db Database instance
 * @param isDryRun If true, only logs what would be done without actually making changes
 */
async function dropAllTables(
	db: PostgresJsDatabase<typeof schema>,
	isDryRun = false,
): Promise<void> {
	// First get a list of all tables in the public schema
	const publicResult = await db.execute(sql`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
  `);

	// Type safety for database results
	type QueryResult = Array<{ tablename: string }>;
	type TypeQueryResult = Array<{ typname: string }>;

	const publicTables = (publicResult as unknown as QueryResult).map(
		(row) => row.tablename,
	);
	console.log(
		`Found ${publicTables.length} tables to drop in public schema: ${publicTables.join(", ")}`,
	);

	// Also get tables in the drizzle schema
	const drizzleResult = await db.execute(sql`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'drizzle'
  `);

	const drizzleTables = (drizzleResult as unknown as QueryResult).map(
		(row) => row.tablename,
	);
	console.log(
		`Found ${drizzleTables.length} tables to drop in drizzle schema: ${drizzleTables.join(", ") || "none"}`,
	);

	// Get all custom types (ENUMs, etc.) in the public schema
	const typesResult = await db.execute(sql`
    SELECT typname FROM pg_type
    JOIN pg_namespace ON pg_type.typnamespace = pg_namespace.oid
    WHERE pg_namespace.nspname = 'public' AND pg_type.typtype = 'e'
  `);

	const customTypes = (typesResult as unknown as TypeQueryResult).map(
		(row) => row.typname,
	);
	console.log(
		`Found ${customTypes.length} custom types to drop: ${customTypes.join(", ") || "none"}`,
	);

	if (!isDryRun) {
		// Drop tables in public schema
		for (const table of publicTables) {
			try {
				// Use raw SQL with identifier escaping to avoid parameter type issues
				await db.execute(sql.raw(`DROP TABLE IF EXISTS "${table}" CASCADE`));
				console.log(`Dropped table: ${table}`);
			} catch (error) {
				console.error(`Error dropping table ${table}:`, error);
			}
		}

		// Drop tables in drizzle schema
		for (const table of drizzleTables) {
			try {
				await db.execute(
					sql.raw(`DROP TABLE IF EXISTS drizzle."${table}" CASCADE`),
				);
				console.log(`Dropped drizzle schema table: ${table}`);
			} catch (error) {
				console.error(`Error dropping drizzle schema table ${table}:`, error);
			}
		}

		// Drop custom types (ENUMs, etc.)
		for (const typeName of customTypes) {
			try {
				await db.execute(sql.raw(`DROP TYPE IF EXISTS "${typeName}" CASCADE;`));
				console.log(`Dropped custom type: ${typeName}`);
			} catch (error) {
				console.error(`Error dropping custom type ${typeName}:`, error);
			}
		}

		// Make sure we try to drop the drizzle schema itself
		try {
			await db.execute(sql.raw("DROP SCHEMA IF EXISTS drizzle CASCADE;"));
			console.log("Dropped drizzle schema");
		} catch (error) {
			console.error("Error dropping drizzle schema:", error);
		}
	} else {
		// Just log what would be dropped in dry run mode
		for (const table of publicTables) {
			console.log(`[DRY RUN] Would drop table: ${table}`);
		}

		// Log drizzle schema tables that would be dropped
		for (const table of drizzleTables) {
			console.log(`[DRY RUN] Would drop drizzle schema table: ${table}`);
		}

		// Log custom types that would be dropped
		for (const typeName of customTypes) {
			console.log(`[DRY RUN] Would drop custom type: ${typeName}`);
		}

		console.log("[DRY RUN] Would drop drizzle schema");
	}
}

/**
 * Show help text for command-line usage
 */
function showHelp(): void {
	console.log(`
Database Reset Script
-------------------
Usage: bun src/db/resetDB.ts [options]

Options:
  --delete       Delete all data from tables without dropping them (default)
  --drop         Drop all tables, custom types, and schemas
  --dry, --dry-run  Perform a dry run (show what would happen without making changes)
  --help, -h     Show this help text

Examples:
  bun src/db/resetDB.ts --delete          # Delete all data
  bun src/db/resetDB.ts --drop            # Drop all tables and types
  bun src/db/resetDB.ts --delete --dry    # Dry run for delete mode
  bun src/db/resetDB.ts --drop --dry-run  # Dry run for drop mode
`);
}

/**
 * Parse command line arguments when running the script directly
 */
function parseCommandLineArgs(): {
	mode: ResetMode;
	options: ResetOptions;
} | null {
	// Default values
	let mode: ResetMode = "delete";
	const options: ResetOptions = { dry: false };

	// Process command line arguments
	const args = process.argv.slice(2);

	// Check for help flag
	if (args.includes("--help") || args.includes("-h")) {
		showHelp();
		return null;
	}

	// Check for mode argument
	if (args.includes("--drop")) {
		mode = "drop";
	} else if (args.includes("--delete")) {
		mode = "delete";
	}

	// Check for dry run flag
	if (args.includes("--dry") || args.includes("--dry-run")) {
		options.dry = true;
	}

	return { mode, options };
}

// When running this file directly (not imported)
if (require.main === module) {
	const result = parseCommandLineArgs();

	// Only proceed if we have valid arguments (not showing help)
	if (result) {
		const { mode, options } = result;
		console.log(
			`Running database reset with mode: ${mode}, dry run: ${options.dry ? "yes" : "no"}`,
		);
		(async () => {
			try {
				await resetDatabase(mode, options);
			} finally {
				// Close the database connection
				await client.end();
			}
		})();
	}
}
