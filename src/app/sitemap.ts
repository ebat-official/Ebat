import { MetadataRoute } from "next";
import { getAllApprovedPosts } from "@/utils/api utils/posts";
import { generatePostPath } from "@/utils/generatePostPath";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = process.env.ENV_URL || "https://ebat.dev";

	// Get all approved posts
	const posts = await getAllApprovedPosts();

	// Static pages
	const staticPages = [
		{
			url: `${baseUrl}/frontend`,
			lastModified: new Date(),
			changeFrequency: "daily" as const,
			priority: 0.8,
		},
	];

	// Dynamic post pages
	const postPages = posts.map((post) => ({
		url: `${baseUrl}${generatePostPath({
			category: post.category,
			subCategory: post.subCategory,
			postType: post.type,
			slug: post.slug || "",
			id: post.id,
		})}`,
		lastModified: new Date(),
		changeFrequency: "weekly" as const,
		priority: 0.7,
	}));

	return [...staticPages, ...postPages];
}
