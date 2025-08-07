import { PostActions } from "@/utils/types";

export const getLocalStorageKey = (
	action: PostActions,
	postId: string,
): string => {
	return `editor-${action}_${postId}`;
};

export const getChallengeTemplatesKey = (
	action: PostActions,
	postId: string,
): string => {
	return `challenge-templates-${action}_${postId}`;
};
