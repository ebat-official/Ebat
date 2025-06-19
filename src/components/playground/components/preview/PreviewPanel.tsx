import { useWebContainerStore } from "../../store/webContainer";
import type { Template } from "../../lib/types";

interface PreviewPanelProps {
	selectedTemplate: Template;
}

export function PreviewPanel({ selectedTemplate }: PreviewPanelProps) {
	const { previewUrl, isContainerReady } = useWebContainerStore();

	if (!selectedTemplate.hasPreview) {
		return null;
	}

	return (
		<div className="w-full h-full border-l border-border bg-card">
			<div className="h-full">
				{isContainerReady && previewUrl ? (
					<iframe
						src={previewUrl}
						className="w-full h-full border-0"
						title="Preview"
					/>
				) : (
					<div className="h-full flex items-center justify-center text-muted-foreground">
						<div className="text-center">
							<p className="text-lg mb-2">Preview not available</p>
							<p className="text-sm">
								{isContainerReady
									? "Waiting for server to start..."
									: "Initializing environment..."}
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
