import DOMPurify from "isomorphic-dompurify";
import React from "react";
// src/components/shared/Lexical Editor/themes/theme.css
import "../shared/Lexical Editor/themes/theme.css";

interface ContentRendererProps {
	html?: string;
	className?: string;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({
	html,
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

	return renderHtml(html);
};
