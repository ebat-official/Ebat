import type { SerializedLexicalNode } from "lexical";
import { ContentType } from "./types";

export function getFirstImageUrl(content: ContentType): string {
	// Helper function with proper typing
	const findFirstImage = (nodes: SerializedLexicalNode[]): string => {
		for (const node of nodes) {
			// Check current node for image type with src property
			if (
				node.type === "image" &&
				"src" in node &&
				typeof node.src === "string"
			) {
				return node.src;
			}

			// Check for nested children with proper type guard
			if ("children" in node && Array.isArray(node.children)) {
				const childResult = findFirstImage(node.children);
				if (childResult) return childResult;
			}
		}
		return "";
	};

	// Check post content first
	if (content.post?.blocks?.root?.children) {
		const postImage = findFirstImage(content.post.blocks.root.children);
		if (postImage) return postImage;
	}

	// Fall back to answer content
	if (content.answer?.blocks?.root?.children) {
		const answerImage = findFirstImage(content.answer.blocks.root.children);
		if (answerImage) return answerImage;
	}

	return "";
}
