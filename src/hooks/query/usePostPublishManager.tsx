import { createDraftPost, createPost, createPostEdit } from "@/actions/post";
import { PostStatusType, PostType, SubCategory } from "@/db/schema/enums";
import { useServerAction } from "@/hooks/useServerAction";
import { PostDraftValidator, PostValidator } from "@/lib/validators/post";
import { ERROR, POST_ACTIONS } from "@/utils/constants";
import { PostActions, SubCategoryType } from "@/utils/types";
import { useState } from "react";

type ValidatedDraftData = ReturnType<typeof PostDraftValidator.parse>;
type ValidatedPostData = ReturnType<typeof PostValidator.parse>;

export const usePostPublishManager = (
	subCategory: SubCategoryType,
	action: PostActions = POST_ACTIONS.CREATE,
) => {
	// Separate loading states for draft and publish actions
	const [createDraft, isDrafting] = useServerAction(createDraftPost);
	const publishingAction =
		action === POST_ACTIONS.CREATE ? createPost : createPostEdit;
	const [publishPost, isPublishing] = useServerAction(publishingAction);

	const [error, setError] = useState<unknown | null>(null);

	/**
	 * Handles saving a draft.
	 */
	const saveDraft = async (validatedData: ValidatedDraftData) => {
		try {
			const data = await createDraft(validatedData);
			if (data.status === ERROR) {
				throw data;
			}
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
	const publish = async (
		validatedData: ValidatedPostData,
		postStatus?: PostStatusType,
	) => {
		try {
			const data = await publishPost(validatedData, postStatus);
			if (data.status === ERROR) throw data;
			setError(null);
			return { data: data.data, error: null, isLoading: false };
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
