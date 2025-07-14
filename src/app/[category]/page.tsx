import { FeedProvider } from "@/components/feed/FeedContext";
import { PostSearchResponse, PostSortOrder } from "@/utils/types";
import { EndpointMap } from "@/utils/contants";
import { PostCategory, SubCategory } from "@/db/schema/enums";
import { notFound } from "next/navigation";
import { fetchPostSearch } from "@/utils/api utils/posts";
import { Feed } from "@/components/feed/Feed";
import { generateCategoryMetadata } from "@/utils/categoryMetadata";
import { Metadata } from "next";

type PageProps = Promise<{
	category: string;
	subCategory: string;
}>;

// Metadata generation for the blogs page
export async function generateMetadata({
	params,
}: {
	params: PageProps;
}): Promise<Metadata> {
	const awaitedParams = await params;
	const { category: categoryRoute } = awaitedParams;

	const category = categoryRoute?.toLowerCase();
	const subCategory = SubCategory.BLOGS;

	// Validate parameters
	if (
		!category ||
		!Object.values(PostCategory).includes(category as PostCategory) ||
		(subCategory !== SubCategory.BLOGS &&
			subCategory !== SubCategory.SYSTEMDESIGN)
	) {
		return {};
	}

	// Generate metadata using utility function
	const metadata = generateCategoryMetadata(
		category as PostCategory,
		subCategory as SubCategory,
	);

	// Generate canonical URL
	const url = `${process.env.ENV_URL}/${categoryRoute.toLowerCase()}}`;

	return {
		title: metadata.title,
		description: metadata.description,
		alternates: {
			canonical: url,
		},
		openGraph: {
			title: metadata.title,
			description: metadata.description,
			url,
			type: "website",
			siteName: "EBAT",
		},
		twitter: {
			card: "summary_large_image",
			title: metadata.title,
			description: metadata.description,
		},
		robots: {
			index: true,
			follow: true,
		},
		keywords: metadata.keywords.join(", "),
	};
}

// SSR: fetch data on every request
export default async function Page({ params }: { params: PageProps }) {
	const awaitedParams = await params;
	if (awaitedParams.category.toLowerCase() !== PostCategory.FRONTEND) {
		return notFound();
	}

	const queryParams = {
		category: awaitedParams.category,
		subCategory: SubCategory.BLOGS,
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
