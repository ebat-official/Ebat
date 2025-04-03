import type { SerializedLexicalNode } from "lexical";
import { ContentType } from "./types";

export function getFirstParagraphText(content: ContentType): string {
	// Helper function to find first paragraph text
	const findFirstParagraph = (nodes: SerializedLexicalNode[]): string => {
		for (const node of nodes) {
			// Check for paragraph nodes
			if (
				node.type === "paragraph" &&
				"children" in node &&
				Array.isArray(node.children)
			) {
				// Extract text from all text nodes in this paragraph
				const textContent = extractTextFromNodes(node.children);
				if (textContent) return textContent;
			}

			// Recursively check children if current node isn't a paragraph
			if ("children" in node && Array.isArray(node.children)) {
				const childResult = findFirstParagraph(node.children);
				if (childResult) return childResult;
			}
		}
		return "";
	};

	// Helper to extract text from a group of nodes
	const extractTextFromNodes = (nodes: SerializedLexicalNode[]): string => {
		let text = "";
		for (const node of nodes) {
			if (
				node.type === "text" &&
				"text" in node &&
				typeof node.text === "string"
			) {
				text += node.text;
			}
			// Handle line breaks
			else if (node.type === "linebreak") {
				text += "\n";
			}
		}
		return text.trim();
	};

	// Check post content first
	if (content.post?.blocks?.root?.children) {
		const postText = findFirstParagraph(content.post.blocks.root.children);
		if (postText) return postText;
	}

	// Fall back to answer content
	if (content.answer?.blocks?.root?.children) {
		const answerText = findFirstParagraph(content.answer.blocks.root.children);
		if (answerText) return answerText;
	}

	return "";
}
