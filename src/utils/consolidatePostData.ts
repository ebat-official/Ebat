import { Post } from "@/db/schema/zod-schemas";
import { PostType } from "@/db/schema/enums";
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
	...rest
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
		...rest,
	};
};

export default consolidatePostData;
