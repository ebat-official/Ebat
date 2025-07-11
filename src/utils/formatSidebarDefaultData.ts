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

export const formatSidebarDefaultDataForPosts = (posts: Post[]) => {
	return posts.map((post) => ({
		id: post.id,
		title: post.title,
		category: post.category,
		subCategory: post.subCategory,
		type: post.type,
		slug: post.slug,
		thumbnail: post.thumbnail,
		difficulty: post.difficulty,
		createdAt: post.createdAt,
		updatedAt: post.updatedAt,
		coins: post.coins,
		topics: post.topics,
		companies: post.companies,
		completionDuration: post.completionDuration,
	}));
};

export default formatSidebarDefaultData;
