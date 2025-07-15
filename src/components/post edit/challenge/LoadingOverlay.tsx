import { Loader2 } from "lucide-react";
import React, { FC } from "react";

interface LoadingOverlayProps {
	isLoading: boolean;
	isSaving: boolean;
}

const LoadingOverlay: FC<LoadingOverlayProps> = ({ isLoading, isSaving }) => {
	if (!isLoading && !isSaving) return null;

	return (
		<div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
			<div className="flex flex-col items-center gap-4">
				<Loader2 className="h-16 w-16 animate-spin" />
				<p className="text-lg">
					{isSaving ? "Saving templates..." : "Loading template..."}
				</p>
			</div>
		</div>
	);
};

export default LoadingOverlay;
