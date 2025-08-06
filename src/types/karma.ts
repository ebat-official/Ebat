import {
	PostType,
	VoteType,
	PostCategory,
	SubCategory,
} from "@/db/schema/enums";

export interface KarmaMetadata {
	postId?: string;
	commentId?: string;
	postType?: PostType;
	voteType?: VoteType;
	baseAmount?: number;
	postTitle?: string | null;
	category?: PostCategory | null;
	subCategory?: SubCategory | null;
	slug?: string | null;
	isApprover?: boolean;
	[key: string]: unknown;
}

export interface KarmaLogEntry {
	id: string;
	userId: string;
	fromUserId?: string;
	action: string;
	karmaChange: number;
	postId?: string;
	commentId?: string;
	metadata?: KarmaMetadata;
	createdAt: string;
	fromUser?: {
		username: string;
		displayUsername?: string;
	};
}

export interface KarmaHistoryResponse {
	karmaLogs: KarmaLogEntry[];
	pagination: {
		limit: number;
		offset: number;
		total: number;
		totalPages: number;
	};
}
