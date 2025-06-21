import { ContentReturnType } from "@/utils/types";
import React from "react";
import DOMPurify from "isomorphic-dompurify";
// src/components/shared/Lexical Editor/themes/theme.css
import "../shared/Lexical Editor/themes/theme.css";
import { cn } from "@/lib/utils";
interface PostContentRenderProps {
	content: ContentReturnType;
	className?: string;
}

export const PostContentRender: React.FC<PostContentRenderProps> = ({
	content,
	className = "",
}) => {
	// Safely render HTML content by sanitizing it first
	const renderHtml = (html?: string) => {
		if (!html) return null;

		const sanitizedHtml = DOMPurify.sanitize(html);

		return (
			<div
				className="post-content editor"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
				dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
			/>
		);
	};

	return (
		<div className={cn("post-content-container", className)}>
			{content.post && (
				<div className="post-section ">{renderHtml(content.post)}</div>
			)}

			{content.answer && (
				<div className="answer-section">{renderHtml(content.answer)}</div>
			)}
		</div>
	);
};
