import { PostType } from "@/db/schema/enums";

export const getTitlePlaceholder = (postType: PostType): string => {
	switch (postType) {
		case PostType.QUESTION:
		case PostType.CHALLENGE:
			return "Question";
		case PostType.BLOGS:
		case PostType.HLD:
		case PostType.LLD:
			return "Title";
		default:
			return "Title";
	}
};

export const getContentPlaceholder = (postType: PostType): string => {
	switch (postType) {
		case PostType.QUESTION:
		case PostType.CHALLENGE:
			return "Add more info to clarify (optional)...";
		case PostType.BLOGS:
			return "Type your blog here...";
		case PostType.HLD:
		case PostType.LLD:
			return "Design your system here...";
		default:
			return "Type your content here...";
	}
};

export const getAnswerPlaceholder = (): string => {
	return "Provide a clear and helpful answer (required)...";
};
