import { FeedProvider } from "@/components/feed/FeedContext";
import { PostSortOrder } from "@/utils/types";
import { SubCategory, PostCategory, PostCategoryType, SubCategoryType } from "@/db/schema/enums";
import { notFound } from "next/navigation";
import { fetchPostSearch } from "@/utils/api utils/posts";
import { Feed } from "@/components/feed/Feed";
import type { Metadata } from "next";
import { generateCategoryMetadata } from "@/utils/categoryMetadata";

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
	const { category: categoryRoute, subCategory: subCategoryRoute } =
		awaitedParams;

	const category = categoryRoute?.toUpperCase();
	const subCategory = subCategoryRoute?.toUpperCase() || SubCategory.BLOGS;

	// Validate parameters
	if (
		!category ||
		!Object.values(PostCategory).includes(category as PostCategoryType) ||
		(subCategory !== SubCategory.BLOGS &&
			subCategory !== SubCategory.SYSTEMDESIGN)
	) {
		return {};
	}

	// Generate metadata using utility function
	const metadata = generateCategoryMetadata(
		category as PostCategoryType,
		subCategory as SubCategoryType,
	);

	// Generate canonical URL
	const url = `${process.env.ENV_URL}/${categoryRoute.toLowerCase()}/${subCategoryRoute.toLowerCase()}`;

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
