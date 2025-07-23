import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export const statement = {
	...defaultStatements,
	post: ["create", "share", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
	post: ["create", "share", "update", "delete"],
});

export const editor = ac.newRole({
	post: ["create", "share", "update", "delete"],
});

export const moderator = ac.newRole({
	post: ["create", "share", "update", "delete"],
});

export const admin = ac.newRole({
	...adminAc.statements,
	post: ["create", "share", "update", "delete"],
});
