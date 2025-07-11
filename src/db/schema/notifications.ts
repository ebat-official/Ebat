import {
	pgTable,
	uuid,
	varchar,
	text,
	boolean,
	timestamp,
	index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

// Notifications table
export const notifications = pgTable(
	"Notification",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("userId").notNull(),
		type: varchar("type", { length: 100 }).notNull(),
		message: text("message").notNull(),
		isRead: boolean("isRead").notNull().default(false),
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		link: varchar("link", { length: 500 }),
		relatedId: varchar("relatedId", { length: 255 }),
	},
	(table) => ({
		userIdIsReadIdx: index("Notification_userId_isRead_idx").on(
			table.userId,
			table.isRead,
		),
	}),
);

// Relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id],
	}),
}));
