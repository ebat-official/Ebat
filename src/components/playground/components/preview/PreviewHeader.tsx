import React from "react";

interface PreviewHeaderProps {
	previewUrl: string;
}

export function PreviewHeader({ previewUrl }: PreviewHeaderProps) {
	return (
		<div className="h-12 bg-muted/50 border-b border-border flex items-center px-4 justify-between">
			<span className="text-sm text-muted-foreground">Preview</span>
			{previewUrl && (
				<button
					onClick={() => window.open(previewUrl, "_blank")}
					className="text-xs text-primary hover:text-primary/80 px-3 py-1 rounded bg-muted hover:bg-muted/80 transition-colors"
				>
					Open in new tab
				</button>
			)}
		</div>
	);
}
