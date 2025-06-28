"use client";

import React from "react";
import { RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreviewControlsProps {
	onRefresh: () => void;
	url: string;
}

export const PreviewControls: React.FC<PreviewControlsProps> = React.memo(
	({ onRefresh, url }) => (
		<div className="absolute top-4 right-4 flex gap-2">
			<Button size="sm" variant="secondary" onClick={onRefresh}>
				<RefreshCw className="w-4 h-4" />
			</Button>
			{/* <Button
				size="sm"
				variant="secondary"
				onClick={() => window.open(url, "_blank")}
			>
				<ExternalLink className="w-4 h-4" />
			</Button> */}
		</div>
	),
);

PreviewControls.displayName = "PreviewControls";
