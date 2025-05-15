import { Post, PostType } from "@prisma/client";
import {
	CategoryType,
	ContentType,
	QuestionSidebarData,
	SubCategoryType,
} from "@/utils/types";

interface ConsolidatePostDataProps {
	postId: string;
	category: CategoryType;
	postContent: ContentType;
	type: PostType;
	sidebarData: Record<string, unknown>;
	subCategory?: SubCategoryType;
	thumbnail?: string | null;
}

const consolidatePostData = ({
	postId,
	category,
	postContent,
	type,
	sidebarData,
	subCategory,
	thumbnail,
}: ConsolidatePostDataProps) => {
	return {
		id: postId,
		type,
		category,
		title: postContent?.post?.title,
		content: postContent,
		subCategory,
		thumbnail,
		...sidebarData,
	};
};

export default consolidatePostData;
