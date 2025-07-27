"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface DiffToggleButtonProps {
	postId: string;
}

const DiffToggleButton: React.FC<DiffToggleButtonProps> = ({ postId }) => {
	const router = useRouter();
	const searchParams = useSearchParams();

	const currentDiffView = searchParams.get("diffview");
	const isDiffViewActive = currentDiffView === "true";

	const toggleDiffView = () => {
		const params = new URLSearchParams(searchParams);

		if (isDiffViewActive) {
			// Remove diffview parameter
			params.delete("diffview");
		} else {
			// Add diffview parameter
			params.set("diffview", "true");
		}

		// Use current URL and update params
		const currentUrl = window.location.pathname;
		const newUrl = `${currentUrl}?${params.toString()}`;
		window.location.href = newUrl;
	};

	return (
		<Button
			onClick={toggleDiffView}
			variant="outline"
			size="sm"
			className="gap-2 mx-auto"
		>
			{isDiffViewActive ? (
				<EyeOff className="w-4 h-4" />
			) : (
				<Eye className="w-4 h-4" />
			)}
			{isDiffViewActive ? "Hide Diff" : "Show Diff"}
		</Button>
	);
};

export default DiffToggleButton;
