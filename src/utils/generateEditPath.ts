import {
	PostCategoryType,
	PostType,
	PostTypeType,
	SubCategoryType,
	PostApprovalStatus,
} from "@/db/schema/enums";

interface GenerateEditPathParams {
	category: PostCategoryType;
	subCategory: SubCategoryType | null;
	postType: PostTypeType;
	postId: string;
	approvalStatus?: PostApprovalStatus;
	isPostEdit?: boolean;
}

export function generateEditPath({
	category,
	subCategory,
	postType,
	postId,
	approvalStatus,
	isPostEdit = false,
}: GenerateEditPathParams): string {
	// Determine the post type path
	const postTypePath =
		postType === PostType.CHALLENGE || postType === PostType.QUESTION
			? `${postType}s/`
			: "";

	// For post edits, always use edit path
	// For regular posts, determine based on approval status
	const actionPath = isPostEdit
		? "edit"
		: approvalStatus === PostApprovalStatus.PENDING
			? "create"
			: "edit";

	// Build the edit URL
	const editUrl = `/${category.toLowerCase()}/${subCategory?.toLowerCase() || ""}/${postTypePath}${actionPath}/${postId}`;

	return editUrl;
}
