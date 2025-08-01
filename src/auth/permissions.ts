import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export const statement = {
	...defaultStatements,
	post: ["create", "update", "delete", "edit-read", "edit-edit"],
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
	post: ["create"],
});

export const editor = ac.newRole({
	post: ["create", "edit-read"],
});

export const moderator = ac.newRole({
	post: ["create", "update", "edit-read"],
});

export const admin = ac.newRole({
	...adminAc.statements,
	post: ["create", "update", "delete", "edit-read", "edit-edit"],
});

export const superadmin = ac.newRole({
	...adminAc.statements,
	post: ["create", "update", "delete", "edit-read", "edit-edit"],
	// Super admin has all permissions
});
