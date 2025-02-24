import { OutputData } from "@editorjs/editorjs";
import { PostCategory,SubCategory } from "@prisma/client";
export interface EditorContent extends OutputData {
    title?: string;
}

export interface ContentType  {
    post?: EditorContent;
    answer?: EditorContent;
}

export type PrismaJson = ReturnType<typeof JSON.parse> | null | undefined;


export type CategoryType = keyof typeof PostCategory;
export type SubCategoryType = keyof typeof SubCategory  | undefined;

export type TopicCategory = SubCategory | PostCategory;

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
