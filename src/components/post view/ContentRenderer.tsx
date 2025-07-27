import React from "react";
// src/components/shared/Lexical Editor/themes/theme.css
import "../shared/Lexical Editor/themes/theme.css";
import { HtmlRenderer } from "../shared/HtmlRenderer";
import { cn } from "@/lib/utils";

interface ContentRendererProps {
	html?: string;
	className?: string;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({
	html,
	className = "",
}) => {
	return (
		<HtmlRenderer
			html={html}
			className={cn("post-content editor", className)}
		/>
	);
};
