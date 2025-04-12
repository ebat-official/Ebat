import { Post } from "@prisma/client";
import { QuestionSidebarData } from "./types";

const formatSidebarDefaultData = (
	post: Post | undefined | null,
): QuestionSidebarData | undefined => {
	if (!post) return;
	return {
		companies: post.companies || [],
		topics: post.topics || [],
		difficulty: post.difficulty || "",
		completionDuration: post.completionDuration || 0,
	};
};
export default formatSidebarDefaultData;
