import { PostDraftValidator, PostValidator } from "@/lib/validators/post";
import consolidatePostData from "@/utils/consolidatePostData";
import { PostType } from "@/db/schema/enums";
import {
	CategoryType,
	ContentType,
	QuestionSidebarData,
	SubCategoryType,
} from "@/utils/types";

export const validateDraftData = (params: {
	postId: string;
	category: CategoryType;
	sidebarData: Record<string, unknown>;
	postContent: ContentType;
	type: PostType;
	thumbnail?: string | null;
}) => {
	const consolidated = consolidatePostData(params);
	const result = PostDraftValidator.safeParse(consolidated);
	if (!result.success) {
		return { error: result.error };
	}
	return { data: result.data };
};

export const validateData = (params: {
	postId: string;
	category: CategoryType;
	sidebarData: Record<string, unknown>;
	postContent: ContentType;
	type: PostType;
	thumbnail?: string | null;
}) => {
	const consolidated = consolidatePostData(params);
	const result = PostValidator.safeParse(consolidated);

	if (!result.success) {
		return { error: result.error };
	}
	return { data: result.data };
};

export const getPostData = (
	postContent: ContentType,
	context: {
		postId: string;
		category: CategoryType;
		subCategory: SubCategoryType;
		postType: PostType;
		sidebarData: QuestionSidebarData;
		postData?: { thumbnail?: string | null };
	},
) => {
	const { thumbnail, challengeTemplates, ...content } = postContent;
	const { postId, category, subCategory, postType, sidebarData, postData } =
		context;

	// Update postType based on sidebar data for system design types
	let finalPostType = postType;
	if (
		sidebarData.systemDesignType &&
		(postType === PostType.HLD || postType === PostType.LLD)
	) {
		finalPostType = sidebarData.systemDesignType;
	}

	return {
		postId,
		category,
		subCategory,
		postContent: content,
		thumbnail: thumbnail || postData?.thumbnail,
		challengeTemplates,
		sidebarData,
		type: finalPostType,
	};
};
