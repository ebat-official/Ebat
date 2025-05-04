// utils/metadata.ts
import { Metadata } from "next";
import { Post } from "@prisma/client";
import {
	ContentReturnType,
	ContentType,
	PostWithExtraDetails,
} from "@/utils/types";
import { getFirstImageUrl } from "@/utils/getFirstPostImage";
import { getMetaDescription } from "./getMetaDescription";

export interface MetadataOptions {
	url?: string;
	prevUrl?: string; // For pagination (optional)
	nextUrl?: string; // For pagination (optional)
}

export const extractMetadata = (
	post: PostWithExtraDetails,
	options: MetadataOptions = {},
) => {
	const { url } = options;
	const content = post.content as ContentReturnType;

	// Generate metadata fields
	const metaTitle = `${post.title} - ${post.topics?.join(", ") || "EBAT"}`;
	const metaDescription =
		getMetaDescription(content.post || "") ||
		`Learn more about ${post.topics?.join(", ") || "various topics"} on EBAT`;
	const metaImage = getFirstImageUrl(content.post || "");
	const postUrl = `${process.env.ENV_URL}${url}`;
	const authorName = post.author?.userProfile?.name || "Unknown Author";
	// Generate keywords
	const topics = post.topics?.join(", ") || "";
	const companies = post.companies?.join(", ") || "";
	const additionalKeywords = `${post.category} question asked in, ${companies}`;
	const keywords = `${topics}, ${additionalKeywords}`.trim();

	return {
		metaTitle,
		metaDescription,
		metaImage,
		postUrl,
		authorName,
		keywords,
		publishedTime: post.createdAt.toISOString(),
	};
};

export const generatePageMetadata = (
	post: PostWithExtraDetails,
	options?: MetadataOptions,
): Metadata => {
	const {
		metaTitle,
		metaDescription,
		metaImage,
		postUrl,
		authorName,
		keywords,
		publishedTime,
	} = extractMetadata(post, options);

	return {
		title: metaTitle,
		description: metaDescription,
		alternates: {
			canonical: postUrl,
		},
		openGraph: {
			title: metaTitle,
			description: metaDescription,
			url: postUrl,
			images: [metaImage],
			type: "article",
			authors: authorName,
			publishedTime,
		},
		twitter: {
			card: "summary_large_image",
			title: metaTitle,
			description: metaDescription,
			images: [metaImage],
		},
		robots: {
			index: true,
			follow: true,
		},
		keywords, // Add keywords here
	};
};

export const generateStructuredData = (
	post: PostWithExtraDetails,
	options?: MetadataOptions,
) => {
	const {
		metaTitle,
		metaDescription,
		metaImage,
		postUrl,
		authorName,
		publishedTime,
		keywords,
	} = extractMetadata(post, options);

	return {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: metaTitle,
		description: metaDescription,
		author: {
			"@type": "Person",
			name: authorName,
		},
		datePublished: publishedTime,
		image: metaImage,
		url: postUrl,
		keywords,
		breadcrumb: {
			"@type": "BreadcrumbList",
			itemListElement: [
				{
					"@type": "ListItem",
					position: 1,
					name: "Home",
					item: `${process.env.ENV_URL}/`,
				},
				{
					"@type": "ListItem",
					position: 2,
					name: post.category,
					item: `${process.env.ENV_URL}/category/${post.category.toLowerCase()}`,
				},
				{
					"@type": "ListItem",
					position: 3,
					name: post.title,
					item: postUrl,
				},
			],
		},
	};
};
