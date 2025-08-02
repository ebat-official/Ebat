import { APIRequestContext, APIResponse } from "@playwright/test";

export interface ApiTestData {
	users: {
		regular: {
			email: string;
			password: string;
			username: string;
		};
		admin: {
			email: string;
			password: string;
			username: string;
		};
	};
	posts: {
		question: {
			title: string;
			content: string;
			type: string;
			difficulty: string;
			category: string;
			subCategory: string;
		};
		challenge: {
			title: string;
			content: string;
			type: string;
			difficulty: string;
			category: string;
			subCategory: string;
		};
	};
}

// API Base configuration
export const API_BASE_URL =
	process.env.API_BASE_URL || "http://localhost:3000/api";

// Common headers
export const getAuthHeaders = (token: string) => ({
	Authorization: `Bearer ${token}`,
	"Content-Type": "application/json",
});

export const getDefaultHeaders = () => ({
	"Content-Type": "application/json",
});

// Authentication API helpers
export class AuthAPI {
	constructor(private request: APIRequestContext) {}

	async login(email: string, password: string): Promise<APIResponse> {
		return this.request.post(`${API_BASE_URL}/auth/login`, {
			data: { email, password },
			headers: getDefaultHeaders(),
		});
	}

	async register(userData: {
		email: string;
		password: string;
		username: string;
		displayName: string;
	}): Promise<APIResponse> {
		return this.request.post(`${API_BASE_URL}/auth/register`, {
			data: userData,
			headers: getDefaultHeaders(),
		});
	}

	async forgotPassword(email: string): Promise<APIResponse> {
		return this.request.post(`${API_BASE_URL}/auth/forgot-password`, {
			data: { email },
			headers: getDefaultHeaders(),
		});
	}

	async resetPassword(
		token: string,
		newPassword: string,
	): Promise<APIResponse> {
		return this.request.post(`${API_BASE_URL}/auth/reset-password`, {
			data: { token, newPassword },
			headers: getDefaultHeaders(),
		});
	}

	async verifyEmail(token: string): Promise<APIResponse> {
		return this.request.post(`${API_BASE_URL}/auth/verify-email`, {
			data: { token },
			headers: getDefaultHeaders(),
		});
	}

	async logout(token: string): Promise<APIResponse> {
		return this.request.post(`${API_BASE_URL}/auth/logout`, {
			headers: getAuthHeaders(token),
		});
	}

	async refreshToken(refreshToken: string): Promise<APIResponse> {
		return this.request.post(`${API_BASE_URL}/auth/refresh`, {
			data: { refreshToken },
			headers: getDefaultHeaders(),
		});
	}
}

// User API helpers
export class UserAPI {
	constructor(private request: APIRequestContext) {}

	async getProfile(token: string): Promise<APIResponse> {
		return this.request.get(`${API_BASE_URL}/user/profile`, {
			headers: getAuthHeaders(token),
		});
	}

	async updateProfile(
		token: string,
		profileData: {
			displayName?: string;
			bio?: string;
			jobTitle?: string;
			company?: string;
			location?: string;
		},
	): Promise<APIResponse> {
		return this.request.put(`${API_BASE_URL}/user/profile`, {
			data: profileData,
			headers: getAuthHeaders(token),
		});
	}

	async changePassword(
		token: string,
		currentPassword: string,
		newPassword: string,
	): Promise<APIResponse> {
		return this.request.put(`${API_BASE_URL}/user/password`, {
			data: { currentPassword, newPassword },
			headers: getAuthHeaders(token),
		});
	}

	async deleteAccount(token: string, password: string): Promise<APIResponse> {
		return this.request.delete(`${API_BASE_URL}/user/account`, {
			data: { password },
			headers: getAuthHeaders(token),
		});
	}

	async getUserById(token: string, userId: string): Promise<APIResponse> {
		return this.request.get(`${API_BASE_URL}/user/${userId}`, {
			headers: getAuthHeaders(token),
		});
	}

	async followUser(token: string, userId: string): Promise<APIResponse> {
		return this.request.post(`${API_BASE_URL}/user/${userId}/follow`, {
			headers: getAuthHeaders(token),
		});
	}

	async unfollowUser(token: string, userId: string): Promise<APIResponse> {
		return this.request.delete(`${API_BASE_URL}/user/${userId}/follow`, {
			headers: getAuthHeaders(token),
		});
	}

	async getFollowers(token: string, userId: string): Promise<APIResponse> {
		return this.request.get(`${API_BASE_URL}/user/${userId}/followers`, {
			headers: getAuthHeaders(token),
		});
	}

	async getFollowing(token: string, userId: string): Promise<APIResponse> {
		return this.request.get(`${API_BASE_URL}/user/${userId}/following`, {
			headers: getAuthHeaders(token),
		});
	}
}

// Post API helpers
export class PostAPI {
	constructor(private request: APIRequestContext) {}

	async createPost(
		token: string,
		postData: {
			title: string;
			content: string;
			type: string;
			difficulty: string;
			category: string;
			subCategory: string;
			topics?: string[];
			companies?: string[];
		},
	): Promise<APIResponse> {
		return this.request.post(`${API_BASE_URL}/post`, {
			data: postData,
			headers: getAuthHeaders(token),
		});
	}

	async getPost(postId: string): Promise<APIResponse> {
		return this.request.get(`${API_BASE_URL}/post/${postId}`);
	}

	async updatePost(
		token: string,
		postId: string,
		postData: {
			title?: string;
			content?: string;
			difficulty?: string;
			topics?: string[];
			companies?: string[];
		},
	): Promise<APIResponse> {
		return this.request.put(`${API_BASE_URL}/post/${postId}`, {
			data: postData,
			headers: getAuthHeaders(token),
		});
	}

	async deletePost(token: string, postId: string): Promise<APIResponse> {
		return this.request.delete(`${API_BASE_URL}/post/${postId}`, {
			headers: getAuthHeaders(token),
		});
	}

	async getPosts(filters?: {
		category?: string;
		subCategory?: string;
		type?: string;
		difficulty?: string;
		authorId?: string;
		page?: number;
		limit?: number;
	}): Promise<APIResponse> {
		const params = new URLSearchParams();
		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined) {
					params.append(key, value.toString());
				}
			});
		}

		return this.request.get(`${API_BASE_URL}/post?${params.toString()}`);
	}

	async searchPosts(
		query: string,
		filters?: {
			category?: string;
			type?: string;
			difficulty?: string;
		},
	): Promise<APIResponse> {
		const params = new URLSearchParams({ q: query });
		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined) {
					params.append(key, value.toString());
				}
			});
		}

		return this.request.get(`${API_BASE_URL}/post/search?${params.toString()}`);
	}

	async voteOnPost(
		token: string,
		postId: string,
		voteType: "up" | "down",
	): Promise<APIResponse> {
		return this.request.post(`${API_BASE_URL}/post/${postId}/vote`, {
			data: { voteType },
			headers: getAuthHeaders(token),
		});
	}

	async bookmarkPost(token: string, postId: string): Promise<APIResponse> {
		return this.request.post(`${API_BASE_URL}/post/${postId}/bookmark`, {
			headers: getAuthHeaders(token),
		});
	}

	async removeBookmark(token: string, postId: string): Promise<APIResponse> {
		return this.request.delete(`${API_BASE_URL}/post/${postId}/bookmark`, {
			headers: getAuthHeaders(token),
		});
	}

	async getBookmarks(token: string): Promise<APIResponse> {
		return this.request.get(`${API_BASE_URL}/post/bookmarks`, {
			headers: getAuthHeaders(token),
		});
	}
}

// Comment API helpers
export class CommentAPI {
	constructor(private request: APIRequestContext) {}

	async createComment(
		token: string,
		postId: string,
		content: string,
		parentId?: string,
	): Promise<APIResponse> {
		return this.request.post(`${API_BASE_URL}/post/${postId}/comments`, {
			data: { content, parentId },
			headers: getAuthHeaders(token),
		});
	}

	async updateComment(
		token: string,
		commentId: string,
		content: string,
	): Promise<APIResponse> {
		return this.request.put(`${API_BASE_URL}/comment/${commentId}`, {
			data: { content },
			headers: getAuthHeaders(token),
		});
	}

	async deleteComment(token: string, commentId: string): Promise<APIResponse> {
		return this.request.delete(`${API_BASE_URL}/comment/${commentId}`, {
			headers: getAuthHeaders(token),
		});
	}

	async getComments(
		postId: string,
		page?: number,
		limit?: number,
	): Promise<APIResponse> {
		const params = new URLSearchParams();
		if (page !== undefined) params.append("page", page.toString());
		if (limit !== undefined) params.append("limit", limit.toString());

		return this.request.get(
			`${API_BASE_URL}/post/${postId}/comments?${params.toString()}`,
		);
	}

	async voteOnComment(
		token: string,
		commentId: string,
		voteType: "up" | "down",
	): Promise<APIResponse> {
		return this.request.post(`${API_BASE_URL}/comment/${commentId}/vote`, {
			data: { voteType },
			headers: getAuthHeaders(token),
		});
	}
}

// Challenge API helpers
export class ChallengeAPI {
	constructor(private request: APIRequestContext) {}

	async createChallenge(
		token: string,
		challengeData: {
			postId: string;
			framework: string;
			questionTemplate: Record<string, unknown>;
			answerTemplate: Record<string, unknown>;
		},
	): Promise<APIResponse> {
		return this.request.post(`${API_BASE_URL}/challenge`, {
			data: challengeData,
			headers: getAuthHeaders(token),
		});
	}

	async submitSolution(
		token: string,
		postId: string,
		submissionData: {
			framework: string;
			answerTemplate: Record<string, unknown>;
		},
	): Promise<APIResponse> {
		return this.request.post(`${API_BASE_URL}/challenge/${postId}/submit`, {
			data: submissionData,
			headers: getAuthHeaders(token),
		});
	}

	async getSubmissions(token: string, postId: string): Promise<APIResponse> {
		return this.request.get(`${API_BASE_URL}/challenge/${postId}/submissions`, {
			headers: getAuthHeaders(token),
		});
	}

	async runCode(code: string, language: string): Promise<APIResponse> {
		return this.request.post(`${API_BASE_URL}/challenge/run`, {
			data: { code, language },
			headers: getDefaultHeaders(),
		});
	}
}

// Admin API helpers
export class AdminAPI {
	constructor(private request: APIRequestContext) {}

	async getUsers(
		token: string,
		filters?: {
			role?: string;
			status?: string;
			page?: number;
			limit?: number;
		},
	): Promise<APIResponse> {
		const params = new URLSearchParams();
		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined) {
					params.append(key, value.toString());
				}
			});
		}

		return this.request.get(
			`${API_BASE_URL}/admin/users?${params.toString()}`,
			{
				headers: getAuthHeaders(token),
			},
		);
	}

	async banUser(
		token: string,
		userId: string,
		reason: string,
	): Promise<APIResponse> {
		return this.request.post(`${API_BASE_URL}/admin/user/${userId}/ban`, {
			data: { reason },
			headers: getAuthHeaders(token),
		});
	}

	async unbanUser(token: string, userId: string): Promise<APIResponse> {
		return this.request.delete(`${API_BASE_URL}/admin/user/${userId}/ban`, {
			headers: getAuthHeaders(token),
		});
	}

	async changeUserRole(
		token: string,
		userId: string,
		role: string,
	): Promise<APIResponse> {
		return this.request.put(`${API_BASE_URL}/admin/user/${userId}/role`, {
			data: { role },
			headers: getAuthHeaders(token),
		});
	}

	async getPendingPosts(token: string): Promise<APIResponse> {
		return this.request.get(`${API_BASE_URL}/admin/posts/pending`, {
			headers: getAuthHeaders(token),
		});
	}

	async approvePost(token: string, postId: string): Promise<APIResponse> {
		return this.request.post(`${API_BASE_URL}/admin/post/${postId}/approve`, {
			headers: getAuthHeaders(token),
		});
	}

	async rejectPost(
		token: string,
		postId: string,
		reason: string,
	): Promise<APIResponse> {
		return this.request.post(`${API_BASE_URL}/admin/post/${postId}/reject`, {
			data: { reason },
			headers: getAuthHeaders(token),
		});
	}

	async getReports(token: string): Promise<APIResponse> {
		return this.request.get(`${API_BASE_URL}/admin/reports`, {
			headers: getAuthHeaders(token),
		});
	}

	async resolveReport(
		token: string,
		reportId: string,
		action: string,
	): Promise<APIResponse> {
		return this.request.put(`${API_BASE_URL}/admin/report/${reportId}`, {
			data: { action },
			headers: getAuthHeaders(token),
		});
	}
}

// Utility functions
export const createTestUser = async (
	authAPI: AuthAPI,
	userData: {
		email: string;
		password: string;
		username: string;
		displayName: string;
	},
) => {
	const response = await authAPI.register(userData);
	expect(response.status()).toBe(201);
	return response.json();
};

export const loginTestUser = async (
	authAPI: AuthAPI,
	email: string,
	password: string,
) => {
	const response = await authAPI.login(email, password);
	expect(response.status()).toBe(200);
	return response.json();
};

export const createTestPost = async (
	postAPI: PostAPI,
	token: string,
	postData: {
		title: string;
		content: string;
		type: string;
		difficulty: string;
		category: string;
		subCategory: string;
	},
) => {
	const response = await postAPI.createPost(token, postData);
	expect(response.status()).toBe(201);
	return response.json();
};

export const cleanupTestData = async (
	request: APIRequestContext,
	token: string,
) => {
	// This would typically involve API calls to clean up test data
	// Implementation depends on your backend structure
	console.log("Cleaning up test data...");
};

// Response validation helpers
export const expectSuccessfulResponse = (response: APIResponse) => {
	expect(response.status()).toBeGreaterThanOrEqual(200);
	expect(response.status()).toBeLessThan(300);
};

export const expectCreatedResponse = (response: APIResponse) => {
	expect(response.status()).toBe(201);
};

export const expectBadRequestResponse = (response: APIResponse) => {
	expect(response.status()).toBe(400);
};

export const expectUnauthorizedResponse = (response: APIResponse) => {
	expect(response.status()).toBe(401);
};

export const expectForbiddenResponse = (response: APIResponse) => {
	expect(response.status()).toBe(403);
};

export const expectNotFoundResponse = (response: APIResponse) => {
	expect(response.status()).toBe(404);
};

export const expectValidationError = async (
	response: APIResponse,
	field: string,
) => {
	expect(response.status()).toBe(400);
	const body = await response.json();
	expect(body.errors).toBeDefined();
	expect(body.errors[field]).toBeDefined();
};
