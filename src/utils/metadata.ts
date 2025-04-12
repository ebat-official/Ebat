// utils/metadata.ts
import { Metadata } from "next";
import { Post } from "@prisma/client";
import { ContentType } from "@/utils/types";
import { getFirstImageUrl } from "@/utils/getFirstPostImage";
import { getFirstParagraphText } from "@/utils/getFirstParagraphText";

export interface PostWithAuthor extends Post {
	author?: {
		name: string | null;
	} | null;
}

export interface MetadataOptions {
	url?: string;
}

export const extractMetadata = (
	post: PostWithAuthor,
	options: MetadataOptions = {},
) => {
	const { url } = options;
	const content = post.content as ContentType;

	const metaTitle = post.title || "Default Title";
	const metaDescription =
		getFirstParagraphText(content).slice(0, 150) || "Default description";
	const metaImage = getFirstImageUrl(content) || "/default-image.jpg";
	const postUrl = `${process.env.ENV_URL}${url}`;
	const authorName = post.author?.name || "Unknown Author";

	return {
		metaTitle,
		metaDescription,
		metaImage,
		postUrl,
		authorName,
		publishedTime: new Date().toISOString(),
	};
};

export const generatePageMetadata = (
	post: PostWithAuthor,
	options?: MetadataOptions,
): Metadata => {
	const {
		metaTitle,
		metaDescription,
		metaImage,
		postUrl,
		authorName,
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
	};
};

export const generateStructuredData = (
	post: PostWithAuthor,
	options?: MetadataOptions,
) => {
	const {
		metaTitle,
		metaDescription,
		metaImage,
		postUrl,
		authorName,
		publishedTime,
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
	};
};
