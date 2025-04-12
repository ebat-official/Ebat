import { useState } from "react";
import { useServerAction } from "@/hooks/useServerAction";
import { createDraftPost, createPost, createPostEdit } from "@/actions/post";
import { PostDraftValidator, PostValidator } from "@/lib/validators/post";
import consolidatePostData from "@/utils/consolidatePostData";
import { CategoryType, ContentType, PostActions } from "@/utils/types";
import { PostType } from "@prisma/client";
import { POST_ACTIONS } from "@/utils/contants";

type PostParams = {
	postId: string;
	category: CategoryType;
	sidebarData: Record<string, unknown>;
	postContent: ContentType;
	type: PostType;
};

export const usePostPublishManager = (
	action: PostActions = POST_ACTIONS.CREATE,
) => {
	// Separate loading states for draft and publish actions
	const [createDraft, isDrafting] = useServerAction(createDraftPost);
	const publishingAction =
		action === POST_ACTIONS.EDIT ? createPostEdit : createPost;
	const [publishPost, isPublishing] = useServerAction(publishingAction);

	const [error, setError] = useState<unknown | null>(null);

	/**
	 * Validates draft post data
	 */
	const validateDraftData = (params: PostParams) => {
		const consolidated = consolidatePostData(params);
		const result = PostDraftValidator.safeParse(consolidated);

		if (!result.success) {
			setError(result.error);
			return { error: result.error };
		}

		setError(null);
		return { data: result.data };
	};

	/**
	 * Validates post data before publishing
	 */
	const validateData = (params: PostParams) => {
		const consolidated = consolidatePostData(params);
		const result = PostValidator.safeParse(consolidated);

		if (!result.success) {
			setError(result.error);
			return { error: result.error };
		}

		setError(null);
		return { data: result.data };
	};

	/**
	 * Handles saving a draft.
	 */
	const saveDraft = async (params: PostParams) => {
		const validated = validateDraftData(params);
		if (validated.error) return { error: validated.error, isLoading: false };

		try {
			const data = await createDraft(validated.data);
			setError(null);
			return { data, error: null, isLoading: false };
		} catch (error) {
			setError(error);
			return { error, isLoading: false };
		}
	};

	/**
	 * Handles publishing a post.
	 */
	const publish = async (params: PostParams) => {
		const validated = validateData(params);
		if (validated.error) return { error: validated.error, isLoading: false };

		try {
			const data = await publishPost(validated.data);
			setError(null);
			return { data, error: null, isLoading: false };
		} catch (error) {
			setError(error);
			return { error, isLoading: false };
		}
	};

	return {
		saveDraft,
		publish,
		isDrafting,
		isPublishing,
		error,
	};
};
