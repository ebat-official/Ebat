import { customType } from "drizzle-orm/pg-core";

// Custom bytea type for binary data storage
export const bytea = customType<{
	data: Buffer;
	notNull: false;
	default: false;
}>({
	dataType() {
		return "bytea";
	},
	toDriver(value: unknown): Buffer {
		if (Buffer.isBuffer(value)) {
			return value;
		}
		throw new Error("Expected Buffer for bytea field");
	},
	fromDriver(value: unknown): Buffer {
		if (Buffer.isBuffer(value)) {
			return value;
		}
		throw new Error("Expected Buffer from database");
	},
});
