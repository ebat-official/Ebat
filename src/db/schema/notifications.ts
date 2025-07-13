import {
	pgTable,
	uuid,
	varchar,
	text,
	boolean,
	timestamp,
	index,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// Notifications table
export const notifications = pgTable(
	"notification",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: varchar("type", { length: 100 }).notNull(),
		message: text("message").notNull(),
		isRead: boolean("is_read").notNull().default(false),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		link: varchar("link", { length: 500 }),
		relatedId: varchar("related_id", { length: 255 }),
	},
	(table) => [
		index("notification_userId_isRead_idx").on(table.userId, table.isRead),
	],
);

// Relations
// Relations moved to relations.ts
