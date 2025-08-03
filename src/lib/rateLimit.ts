import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import type { Duration } from "@upstash/ratelimit";

// Rate limiting category enums
export enum RateLimitCategory {
	CONTENT = "CONTENT",
	INTERACTIONS = "INTERACTIONS",
	UPLOADS = "UPLOADS",
	API = "API",
}

// Rate limiting action enums
export enum ContentActions {
	CREATE_POST = "createPost",
	EDIT_POST = "editPost",
	CREATE_COMMENT = "createComment",
	EDIT_COMMENT = "editComment",
	DELETE_CONTENT = "deleteContent",
}

export enum InteractionActions {
	VOTE = "vote",
	BOOKMARK = "bookmark",
	FOLLOW = "follow",
}

export enum UploadActions {
	FILE_UPLOAD = "fileUpload",
	IMAGE_UPLOAD = "imageUpload",
}

export enum ApiActions {
	SEARCH = "search",
	POSTS = "posts",
	COMMENTS = "comments",
	USER = "user",
}

// Initialize Redis client
const redis = new Redis({
	url: process.env.REDIS_REST_URL_RATE_LIMIT!,
	token: process.env.REDIS_REST_TOKEN_RATE_LIMIT!,
});

// Rate limit configurations for different types of operations
export const RATE_LIMIT_CONFIGS = {
	// Content Creation & Editing
	CONTENT: {
		createPost: { requests: 10, window: "1 h" }, // 10 posts per hour
		editPost: { requests: 20, window: "1 h" }, // 20 edits per hour
		createComment: { requests: 20, window: "1 h" }, // 20 comments per hour
		editComment: { requests: 20, window: "1 h" }, // 20 comment edits per hour
		deleteContent: { requests: 5, window: "1 h" }, // 5 deletions per hour
	},

	// Voting & Interactions
	INTERACTIONS: {
		vote: { requests: 50, window: "1 h" }, // 50 votes per hour
		bookmark: { requests: 50, window: "1 h" }, // 50 bookmarks per hour
		follow: { requests: 20, window: "1 h" }, // 20 follows per hour
	},

	// File Uploads
	UPLOADS: {
		fileUpload: { requests: 20, window: "1 h" }, // 20 file uploads per hour
		imageUpload: { requests: 20, window: "1 h" }, // 20 image uploads per hour
	},

	// API Endpoints
	API: {
		search: { requests: 500, window: "1 m" }, // 50 searches per minute
		posts: { requests: 500, window: "1 m" }, // 50 post requests per minute
		comments: { requests: 300, window: "1 m" }, // 300 comment requests per minute
		user: { requests: 100, window: "1 m" }, // 100 user requests per minute
	},
} as const;

// Create rate limiters for each configuration
const rateLimiters = new Map<string, Ratelimit>();

function getRateLimiter(
	key: string,
	config: { requests: number; window: string },
) {
	const limiterKey = `${key}:${config.requests}:${config.window}`;

	if (!rateLimiters.has(limiterKey)) {
		const ratelimit = new Ratelimit({
			redis,
			limiter: Ratelimit.fixedWindow(
				config.requests,
				config.window as Duration,
			),
			analytics: true,
			prefix: "@upstash/ratelimit",
		});
		rateLimiters.set(limiterKey, ratelimit);
	}

	return rateLimiters.get(limiterKey)!;
}

// Get client identifier (IP address)
async function getClientIdentifier(): Promise<string> {
	try {
		const headersList = await headers();
		const forwardedFor = headersList.get("x-forwarded-for");
		const realIp = headersList.get("x-real-ip");
		const cfConnectingIp = headersList.get("cf-connecting-ip");

		// Try to get the real IP address
		const ip =
			forwardedFor?.split(",")[0] || realIp || cfConnectingIp || "unknown";
		return ip.trim();
	} catch (error) {
		// Fallback for cases where headers() is not available (e.g., in API routes)
		return "unknown";
	}
}

// Rate limit result type
export interface RateLimitResult {
	success: boolean;
	remaining: number;
	reset: number;
	limit: number;
	error?: string;
}

// Main rate limiting function
export async function rateLimit(
	category: RateLimitCategory,
	action: string,
	customConfig?: { requests: number; window: string },
): Promise<RateLimitResult> {
	try {
		const config = customConfig ||
			RATE_LIMIT_CONFIGS[category][
				action as keyof (typeof RATE_LIMIT_CONFIGS)[typeof category]
			] || { requests: 100, window: "1 m" }; // Default fallback

		const limiter = getRateLimiter(`${category}.${action}`, config);
		const identifier = await getClientIdentifier();

		const result = await limiter.limit(identifier);

		return {
			success: result.success,
			remaining: result.remaining,
			reset: result.reset,
			limit: config.requests,
		};
	} catch (error) {
		console.error("Rate limiting error:", error);
		// Allow the request to proceed if rate limiting fails
		return {
			success: true,
			remaining: 1,
			reset: Date.now() + 60000,
			limit: 1,
		};
	}
}

// Decorator-style function for API routes
export async function checkRateLimit(
	category: RateLimitCategory,
	action: string,
	customConfig?: { requests: number; window: string },
): Promise<{ success: boolean; error?: string }> {
	const result = await rateLimit(category, action, customConfig);

	if (!result.success) {
		return {
			success: false,
			error: `Rate limit exceeded. Please try again in ${Math.ceil((result.reset - Date.now()) / 1000)} seconds.`,
		};
	}

	return { success: true };
}
