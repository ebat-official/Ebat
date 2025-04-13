import { OutputData } from "@editorjs/editorjs";
import { Post, PostCategory, PostType, SubCategory } from "@prisma/client";
import { UseQueryOptions } from "@tanstack/react-query";
import { SerializedEditorState } from "lexical";
import { POST_ACTIONS, POST_ROUTE_TYPE } from "./contants";

export interface ContentType {
	post?: EditorContent;
	answer?: EditorContent;
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
export type PostWithExtraDetails = Post & {
	completionCount?: number;
	author?: {
		name: string | null;
	} | null;
};
