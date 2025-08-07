import { ChallengeTemplate, ContentType } from "@/utils/types";

export const createPayload = (
	content: ContentType,
	challengeTemplates: ChallengeTemplate[],
	thumbnail: string | undefined,
	getImageUrls: () => string[],
) => {
	const thumbnailsArr = getImageUrls();
	return {
		...content,
		thumbnail: thumbnail || thumbnailsArr[0],
		challengeTemplates,
	};
};
