export interface TestUser {
	email: string;
	password: string;
	username: string;
	role: "user" | "admin" | "superadmin" | "editor" | "moderator";
	displayName: string;
	isVerified: boolean;
	isActive: boolean;
}

export const testUsers: Record<string, TestUser> = {
	// Regular users
	regularUser: {
		email: "testuser@example.com",
		password: "TestPassword123!",
		username: "testuser",
		role: "user",
		displayName: "Test User",
		isVerified: true,
		isActive: true,
	},

	newUser: {
		email: "newuser@example.com",
		password: "NewPassword123!",
		username: "newuser",
		role: "user",
		displayName: "New User",
		isVerified: false,
		isActive: true,
	},

	unverifiedUser: {
		email: "unverified@example.com",
		password: "Unverified123!",
		username: "unverified",
		role: "user",
		displayName: "Unverified User",
		isVerified: false,
		isActive: true,
	},

	// Content creators
	contentCreator: {
		email: "creator@example.com",
		password: "CreatorPass123!",
		username: "contentcreator",
		role: "user",
		displayName: "Content Creator",
		isVerified: true,
		isActive: true,
	},

	editor: {
		email: "editor@example.com",
		password: "EditorPass123!",
		username: "editor",
		role: "editor",
		displayName: "Editor User",
		isVerified: true,
		isActive: true,
	},

	// Moderators and admins
	moderator: {
		email: "moderator@example.com",
		password: "ModeratorPass123!",
		username: "moderator",
		role: "moderator",
		displayName: "Moderator User",
		isVerified: true,
		isActive: true,
	},

	admin: {
		email: "admin@example.com",
		password: "AdminPass123!",
		username: "admin",
		role: "admin",
		displayName: "Admin User",
		isVerified: true,
		isActive: true,
	},

	superAdmin: {
		email: "superadmin@example.com",
		password: "SuperAdminPass123!",
		username: "superadmin",
		role: "superadmin",
		displayName: "Super Admin",
		isVerified: true,
		isActive: true,
	},

	// Special cases
	bannedUser: {
		email: "banned@example.com",
		password: "BannedPass123!",
		username: "banneduser",
		role: "user",
		displayName: "Banned User",
		isVerified: true,
		isActive: false,
	},

	inactiveUser: {
		email: "inactive@example.com",
		password: "InactivePass123!",
		username: "inactiveuser",
		role: "user",
		displayName: "Inactive User",
		isVerified: true,
		isActive: false,
	},
};

// Helper functions to get users by role
export const getUsersByRole = (role: TestUser["role"]): TestUser[] => {
	return Object.values(testUsers).filter((user) => user.role === role);
};

export const getRegularUsers = (): TestUser[] => getUsersByRole("user");
export const getAdmins = (): TestUser[] => getUsersByRole("admin");
export const getModerators = (): TestUser[] => getUsersByRole("moderator");
export const getEditors = (): TestUser[] => getUsersByRole("editor");

// Helper function to get a specific user
export const getUser = (key: keyof typeof testUsers): TestUser => {
	return testUsers[key];
};

// Test data for registration
export const registrationTestData = {
	validUser: {
		email: "registertest@example.com",
		password: "RegisterPass123!",
		username: "registertest",
		displayName: "Register Test User",
	},

	invalidEmails: [
		"invalid-email",
		"test@",
		"@example.com",
		"test..test@example.com",
	],

	weakPasswords: ["123", "password", "abc123", "Password", "PASSWORD123"],

	existingData: {
		email: "existing@example.com",
		username: "existinguser",
	},
};

// Test data for password reset
export const passwordResetTestData = {
	validEmail: "reset@example.com",
	invalidEmail: "nonexistent@example.com",
	expiredToken: "expired-token-123",
	invalidToken: "invalid-token-456",
};
