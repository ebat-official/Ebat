import { POST_ID_LENGTH } from "@/config";
import { isValidCategoryCombo } from "../isValidCategoryCombo";
import { PostType } from "@/db/schema/enums";
import {
	ContentType,
	PostWithExtraDetails,
	ContentReturnType,
	TableOfContent,
	ChallengeTemplate,
} from "../types";
import { PostCategory, SubCategory } from "@/db/schema/enums";
import { db } from "@/db";
import { posts, postViews, challengeTemplates, completionStatuses } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import pako from "pako";
import { getHtml } from "@/components/shared/Lexical Editor/utils/SSR/jsonToHTML";
import { extractTOCAndEnhanceHTML } from "@/components/shared/Lexical Editor/utils/SSR/extractTOCAndEnhanceHTML";

export async function getPostFromURL(params: {
	category: string;
	subCategory: string;
	titleSlug: string;
}): Promise<PostWithExtraDetails | null> {
	const { titleSlug, category, subCategory } = params;

	// will do it later if required
	// if (!isValidCategoryCombo(category, subCategory)) {
	// 	return null;
	// }

	const id = titleSlug.slice(-POST_ID_LENGTH);
	if (!id) return null;

	try {
		const post = await db.query.posts.findFirst({
			where: eq(posts.id, id),
			with: {
				author: {
					columns: {
						id: true,
						userName: true,
					},
					with: {
						profile: {
							columns: {
								name: true,
								image: true,
								companyName: true,
							},
						},
					},
				},
				challengeTemplates: true,
			},
		});

		if (!post) return null;

		// Get completion count
		const completionCountResult = await db
			.select({ count: count() })
			.from(completionStatuses)
			.where(eq(completionStatuses.postId, id));

		const completionCount = completionCountResult[0]?.count || 0;

		// Get views
		const viewsResult = await db.query.postViews.findFirst({
			where: eq(postViews.postId, id),
			columns: {
				count: true,
				updatedAt: true,
			},
		});

		const ContentHtml: ContentReturnType = {
			post: "",
			answer: "",
		};
		let tableOfContent: TableOfContent = [];

		if (post.content) {
			// Handle both string and Uint8Array content
			let contentData: string;
			if (typeof post.content === 'string') {
				contentData = post.content;
			} else {
				contentData = pako.inflate(post.content, { to: "string" });
			}
			
			const parsedContent = JSON.parse(contentData) as ContentType;

			if (parsedContent.post?.blocks) {
				const postHtml = await getHtml(parsedContent.post.blocks);
				const { toc, htmlWithAnchors } = extractTOCAndEnhanceHTML(postHtml);
				ContentHtml.post = htmlWithAnchors;
				tableOfContent = toc;
			}
			if (parsedContent.answer?.blocks) {
				const answerHtml = await getHtml(parsedContent.answer.blocks);
				ContentHtml.answer = answerHtml;
			}
		}

		const result = {
			...post,
			content: ContentHtml,
			completionCount,
			tableOfContent,
			views: viewsResult,
			challengeTemplates: post.challengeTemplates as unknown as ChallengeTemplate[],
			// Add _count for backward compatibility
			_count: {
				completionStatus: completionCount,
			},
			// Map userProfile to profile for backward compatibility
			author: {
				id: post.author?.id || '',
				userName: post.author?.userName || '',
				userProfile: post.author?.profile || null,
			},
			collaborators: [], // Empty array for now since we're not querying collaborators
		};

		return result as unknown as PostWithExtraDetails;
	} catch (error) {
		console.error("Error fetching post:", error);
		return null;
	}
} 