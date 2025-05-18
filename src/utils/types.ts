import { OutputData } from "@editorjs/editorjs";
import {
	CompletionStatus,
	Post,
	PostCategory,
	PostType,
	SubCategory,
	User,
	VoteType,
} from "@prisma/client";
import { UseQueryOptions } from "@tanstack/react-query";
import { SerializedEditorState } from "lexical";
import {
	COMMENT_SORT_OPTIONS,
	ERROR,
	POST_ACTIONS,
	POST_ROUTE_TYPE,
	SUCCESS,
} from "./contants";
import { boolean } from "zod";

export interface ContentType {
	post?: EditorContent;
	answer?: EditorContent;
	thumbnail?: string;
}
export interface ContentReturnType {
	post?: string;
	answer?: string;
}

export type PrismaJson = ReturnType<typeof JSON.parse> | null | undefined;

export type CategoryType = keyof typeof PostCategory;
export type SubCategoryType =
	| keyof typeof SubCategory
	| DesignBlogType
	| undefined;

export type TopicCategory = SubCategoryType | PostCategory;

export type QuestionSidebarData = {
	companies?: string[];
	topics?: string[];
	difficulty?: string;
	completionDuration?: number;
};
export type CustomErrorType = {
	status?: string;
	cause?: string;
	data?: { message: string };
};

export interface EditorContent {
	title?: string;
	blocks?: SerializedEditorState;
}
export interface EditorReturnContent {
	title?: string;
	blocks?: string;
}
export type PostWithContent = Post & { content: ContentType };
export type postCreateOptions = Partial<
	UseQueryOptions<PostWithContent, Error>
> & {
	action?: PostActions;
};

export type PostActions = (typeof POST_ACTIONS)[keyof typeof POST_ACTIONS];
export type DesignBlogType = Extract<PostType, "BLOGS" | "SYSTEMDESIGN">;
export type PostRouteType =
	(typeof POST_ROUTE_TYPE)[keyof typeof POST_ROUTE_TYPE];

export type PageParams = Promise<{
	category: string;
	subCategory: string;
	titleSlug: string;
}>;
export type PostWithExtraDetails = Omit<Post, "content"> & {
	content: Uint8Array | ContentReturnType;
	completionCount?: number;
	tableOfContent?: TableOfContent;
	collaborators: Array<
		Pick<User, "id" | "userName"> & {
			userProfile: { name: string | null; image: string | null } | null;
		}
	>;
	author: Pick<User, "id" | "userName"> & {
		userProfile: {
			name: string | null;
			image: string | null;
			companyName: string | null;
		} | null;
	};
};

export type CommentSortOption =
	(typeof COMMENT_SORT_OPTIONS)[keyof typeof COMMENT_SORT_OPTIONS];

export type EditorBlockType =
	| "number"
	| "code"
	| "h1"
	| "h2"
	| "h3"
	| "h4"
	| "h5"
	| "h6"
	| "paragraph"
	| "bullet"
	| "check"
	| "quote";

export type UserSearchResult = {
	id: string;
	userName: string;
};

export type CommentWithVotes = {
	id: string;
	content: string | null;
	createdAt: Date;
	updatedAt: Date;
	authorId: string;
	postId: string;
	parentId: string | null;
	author?: {
		id: string;
		name?: string;
		image?: string | null;
		userName: string;
	};
	_count: {
		replies: number;
		votes: number;
	};
	votesAggregate: {
		_count: { _all: number };
		_sum: { voteValue: number };
	};
	upVotes: number;
	downVotes: number;
	userVoteType: VoteType | null;
	repliesExist: boolean;
	repliesLoaded: boolean;
	replies: CommentWithVotes[];
	repliesPagination: {
		hasMore: boolean;
		nextSkip: number;
		totalCount: number;
	};
};

export type PaginatedComments = {
	comments: CommentWithVotes[];
	pagination?: {
		hasMore: boolean;
		totalCount: number;
		currentPage: number;
		totalPages: number;
		nextSkip?: number;
	};
};

export interface RawCommentResult {
	id: string;
	content: Buffer | null;
	createdAt: Date;
	authorId: string;
	postId: string;
	parentId: string | null;
	total_count: number;
	likes: number;
	dislikes: number;
	reply_count: number;
	author?: {
		id: string;
		name: string;
		avatar?: string | null;
	};
}

export type GetOptimizedCommentsOptions = {
	sort?: CommentSortOption;
	take?: number;
	skip?: number;
	depth?: number;
	replyTake?: number;
	replySkip?: number;
	currentPage?: number;
	minScore?: number;
	includeAuthor?: boolean;
	includeVotes?: boolean;
};

export type GenerateActionReturnType<SuccessDataType> =
	| {
			status: SuccessType;
			data: SuccessDataType;
	  }
	| {
			status: ErrorType;
			data: { message: string };
	  };

export type SuccessType = typeof SUCCESS;
export type ErrorType = typeof ERROR;

export type TableOfContent = {
	id: string;
	title: string;
	level: number;
}[];

export type EditorFileUpload = {
	url: string;
	alt: string;
	type: string;
};

export type UploadZone = {
	title: string;
	subtitle: string;
	icon: React.ElementType;
	gradient: string;
	rotate: string;
};

export enum PostSortOrder {
	Latest = "latest",
	Oldest = "oldest",
	MostVotes = "mostVotes",
}

export interface PostSearchContext {
	hasMorePage: boolean;
	totalPages: number;
	page: number;
}

export type FeedPost = Post & {
	completionStatus?: CompletionStatus[];
	_count?: { votes: number; comments: number };
};
export interface PostSearchResponse {
	posts: FeedPost[];
	context: PostSearchContext;
}
export interface UsePostSearchOptions {
	searchQuery?: string;
	difficulty?: string[];
	topics?: string[];
	category?: string;
	subCategory?: string;
	companies?: string[];
	page?: number;
	pageSize?: number;
	sortOrder?: string;
	initialPosts?: any[];
	initialContext?: PostSearchContext;
	enabled?: boolean;
}
