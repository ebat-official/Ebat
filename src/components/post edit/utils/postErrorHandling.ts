import { PostType } from "@/db/schema/enums";
import { handleError } from "@/utils/handleError";
import { POST_NOT_EXIST_ERROR, UNAUTHENTICATED_ERROR } from "@/utils/errors";
import { toast } from "@/hooks/use-toast";

export const handlePostFetchError = (
	error: unknown,
	postType: PostType,
	setters: {
		setLoginModalMessage: (message: string) => void;
		setBlockUserAccess: (
			data: { message?: string; title?: string } | null,
		) => void;
	},
) => {
	const message = handleError(error, postType);

	if (message && message === UNAUTHENTICATED_ERROR.data.message) {
		setters.setLoginModalMessage("Please sign in to edit your post");
		return;
	}
	if (message && message === POST_NOT_EXIST_ERROR.data.message) {
		// User might have reloaded without saving
		return;
	}
	setters.setBlockUserAccess({
		message,
		title: (error as { cause?: string })?.cause || "",
	});
};

export const handlePostPublishError = (
	error: unknown,
	postType: PostType,
	setters: {
		setLoginModalMessage: (message: string) => void;
	},
) => {
	const message = handleError(error, postType);
	if (message && message === UNAUTHENTICATED_ERROR.data.message) {
		setters.setLoginModalMessage("Please sign in to publish your post");
		return;
	}
	toast({
		description: message,
		variant: "destructive",
	});
};
