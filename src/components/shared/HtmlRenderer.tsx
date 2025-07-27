import DOMPurify from "isomorphic-dompurify";
import React from "react";
import { cn } from "@/lib/utils";

interface HtmlRendererProps {
	html?: string;
	className?: string;
}

export const HtmlRenderer: React.FC<HtmlRendererProps> = ({
	html,
	className = "",
}) => {
	// Safely render HTML content by sanitizing it first
	const renderHtml = (html?: string) => {
		if (!html) return null;

		const sanitizedHtml = DOMPurify.sanitize(html);

		return (
			<div
				className={cn(className)}
				// biome-ignore lint/security/noDangerouslySetInnerHtml: Required for HTML rendering
				dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
			/>
		);
	};

	return renderHtml(html);
};
