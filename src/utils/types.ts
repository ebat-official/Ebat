import { OutputData } from "@editorjs/editorjs";
import { Post, PostCategory, PostType, SubCategory } from "@prisma/client";
import { UseQueryOptions } from "@tanstack/react-query";
import { SerializedEditorState } from "lexical";
import { POST_ACTIONS } from "./contants";

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
