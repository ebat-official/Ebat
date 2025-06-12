import { FeedProvider } from "@/components/feed/FeedContext";
import { PostSearchResponse, PostSortOrder } from "@/utils/types";
import { EndpointMap } from "@/utils/contants";
import { SubCategory } from "@prisma/client";
import { notFound } from "next/navigation";
import { fetchPostSearch } from "@/utils/api utils/posts";
import { Feed } from "@/components/feed/Feed";

type PageProps = Promise<{
	category: string;
	subCategory: string;
}>;

// SSR: fetch data on every request
export default async function Page({ params }: { params: PageProps }) {
	const awaitedParams = await params;
	awaitedParams.subCategory = awaitedParams.subCategory || SubCategory.BLOGS;

	if (
		awaitedParams.subCategory.toUpperCase() !== SubCategory.BLOGS &&
		awaitedParams.subCategory.toUpperCase() !== SubCategory.SYSTEMDESIGN
	) {
		return notFound();
	}
	const queryParams = {
		category: awaitedParams.category,
		subCategory: awaitedParams.subCategory,
		page: 1,
		pageSize: 10,
		sortOrder: PostSortOrder.Latest,
	};

	const data = await fetchPostSearch(queryParams);

	return (
		<FeedProvider
			initialPosts={data.posts}
			initialContext={data.context}
			queryParams={queryParams}
		>
			<Feed />
		</FeedProvider>
	);
}
