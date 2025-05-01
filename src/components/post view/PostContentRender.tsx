import { ContentReturnType } from "@/utils/types";
import React from "react";
// src/components/shared/Lexical Editor/themes/theme.css
import "../shared/Lexical Editor/themes/theme.css";
interface PostContentRenderProps {
	content: ContentReturnType;
	className?: string;
}

export const PostContentRender: React.FC<PostContentRenderProps> = ({
	content,
	className = "",
}) => {
	// Safely render HTML content using dangerouslySetInnerHTML
	const renderHtml = (html?: string) => {
		if (!html) return null;

		return (
			<div
				className={`post-content editor ${className}`}
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		);
	};

	return (
		<div className="post-content-container">
			{content.post && (
				<div className="post-section ">{renderHtml(content.post)}</div>
			)}

			{content.answer && (
				<div className="answer-section">{renderHtml(content.answer)}</div>
			)}
		</div>
	);
};
