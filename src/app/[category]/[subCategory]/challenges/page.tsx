import { FeedProvider } from "@/components/feed/FeedContext";
import { PostSearchResponse, PostSortOrder } from "@/utils/types";
import { EndpointMap } from "@/utils/contants";
import { FeedList } from "@/components/feed/FeedList";
import { PostType, SubCategory } from "@/db/schema/enums";
import { notFound } from "next/navigation";
import { fetchPostSearch } from "@/utils/api utils/posts";

type PageProps = Promise<{
	category: string;
	subCategory: string;
}>;

// SSR: fetch data on every request
export default async function Page({ params }: { params: PageProps }) {
	const awaitedParams = await params;
	awaitedParams.subCategory = awaitedParams.subCategory || SubCategory.BLOGS;

	if (
		!Object.values(SubCategory).includes(
			awaitedParams.subCategory.toLowerCase() as SubCategory,
		)
	) {
		return notFound();
	}
	const queryParams = {
		category: awaitedParams.category,
		subCategory: awaitedParams.subCategory,
		page: 1,
		pageSize: 10,
		sortOrder: PostSortOrder.Latest,
		type: PostType.QUESTION,
	};

	const data = await fetchPostSearch(queryParams);

	return (
		<FeedProvider
			initialPosts={data.posts}
			initialContext={data.context}
			queryParams={queryParams}
		>
			<FeedList />
		</FeedProvider>
	);
}
