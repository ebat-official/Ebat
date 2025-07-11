import { VoteTypeType } from "@/db/schema/enums";
import { CommentSortOption, PaginatedComments } from "../types";

// Client-side function to fetch comments via API route
export async function fetchComments(
	postId: string,
	options: {
		page?: number;
		take?: number;
		depth?: number;
		skip?: number;
		sort?: CommentSortOption;
	} = {},
): Promise<PaginatedComments> {
	const { page = 1, take = 10, depth = 1, skip = 0, sort } = options;
	const actualSkip = skip || (page - 1) * take;

	const queryParams = new URLSearchParams({
		page: page.toString(),
		take: take.toString(),
		depth: depth.toString(),
		skip: actualSkip.toString(),
		...(sort && { sort }),
	});

	const response = await fetch(
		`/api/comments/${postId}?${queryParams.toString()}`,
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch comments: ${response.statusText}`);
	}

	return response.json();
}
