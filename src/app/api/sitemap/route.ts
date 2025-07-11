import { serve } from "@upstash/workflow/nextjs";
import { getAllApprovedPosts } from "@/utils/api utils/posts";
import { generatePostPath } from "@/utils/generatePostPath";

// Generate sitemap XML content
function generateSitemapXML(
	posts: Awaited<ReturnType<typeof getAllApprovedPosts>>,
	baseUrl: string,
): string {
	const staticPages = [
		// { url: baseUrl, priority: 1.0, changeFreq: 'daily' as const },
		{ url: `${baseUrl}/frontend`, priority: 0.8, changeFreq: "daily" as const },
		// { url: `${baseUrl}/backend`, priority: 0.8, changeFreq: 'daily' as const },
	];

	const postPages = posts.map((post) => ({
		url: `${baseUrl}${generatePostPath({
			category: post.category,
			subCategory: post.subCategory,
			postType: post.type,
			slug: post.slug || "",
			id: post.id,
		})}`,
		lastModified: new Date(),
		priority: 0.7,
		changeFreq: "weekly" as const,
	}));

	const allPages = [...staticPages, ...postPages];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
	.map(
		(page) => `
  <url>
    <loc>${page.url}</loc>
    ${"lastModified" in page && page.lastModified ? `<lastmod>${page.lastModified.toISOString()}</lastmod>` : ""}
    <changefreq>${page.changeFreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
	)
	.join("")}
</urlset>`;

	return xml;
}

// Ping search engines
async function pingSearchEngines(baseUrl: string) {
	const sitemapUrl = `${baseUrl}/sitemap.xml`;

	const searchEngines = [
		`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
		`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
		`https://search.yahoo.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
	];

	const results = await Promise.allSettled(
		searchEngines.map(async (url) => {
			const response = await fetch(url);
			return { url, status: response.status, ok: response.ok };
		}),
	);

	return results;
}

// POST route to trigger sitemap generation and ping search engines
export const { POST } = serve(async (context) => {
	await context.run("sitemap-generation", async () => {
		const baseUrl = process.env.ENV_URL || "https://ebat.dev";

		// 1. Get all approved posts
		const posts = await getAllApprovedPosts();

		// 2. Generate sitemap XML (for validation)
		const sitemapXML = generateSitemapXML(posts, baseUrl);

		// 3. Ping search engines
		const pingResults = await pingSearchEngines(baseUrl);

		return {
			success: true,
			postsCount: posts.length,
			sitemapSize: sitemapXML.length,
			pingResults,
		};
	});
});
