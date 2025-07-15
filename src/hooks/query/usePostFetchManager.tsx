import { usePost } from "@/hooks/query/usePost";
import { usePostDraft } from "@/hooks/query/usePostDraft";
import { POST_ACTIONS } from "@/utils/contants";
import { PostWithContent } from "@/utils/types";
import { usePostEdit } from "./usePostEdit";

type PostFetchParams = {
	postId?: string;
	action: "edit" | "create";
	enabled?: boolean;
};

const defaultReturnValue = {
	data: null,
	isLoading: false,
	error: null,
};

export const usePostFetchManager = (params: PostFetchParams) => {
	const { postId, action, enabled } = params;
	if (!enabled) {
		return defaultReturnValue;
	}
	if (action === POST_ACTIONS.EDIT) {
		// Call usePost for editing
		return usePostEdit(postId || "");
	}
	if (action === POST_ACTIONS.CREATE) {
		// Call usePostDraft for creating
		return usePostDraft(postId || "", { retry: false });
	}
	return defaultReturnValue;
};
