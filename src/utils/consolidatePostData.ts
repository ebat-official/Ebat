import { Post, PostType } from '@prisma/client';
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
}

const consolidatePostData = ({
    postId,
    category,
    postContent,
    type,
    sidebarData,
    subCategory,
}: ConsolidatePostDataProps)=> {
    return {
        id: postId,
        type,
        category,
        title: postContent?.post?.title,
        content: postContent,
        subCategory,
        ...sidebarData,
    };
};

export default consolidatePostData;
