import { Post } from "@/db/schema/zod-schemas";
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
