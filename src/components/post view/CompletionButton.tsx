"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "../ui/button";
import { CheckIcon } from "lucide-react";
import { useCompletionStatus } from "@/hooks/useCompletionStatus";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export const CompletionButton = ({
	postId,
	className,
	tooltipSide = "right",
}: {
	postId: string;
	className?: string;
	tooltipSide?: "left" | "right";
}) => {
	const { isCompleted, updateCompletionStatus, isLoading } =
		useCompletionStatus([postId]);

	const handleToggleCompletion = async () => {
		if (isLoading) return;
		try {
			const currentlyCompleted = isCompleted(postId);
			await updateCompletionStatus(postId, !currentlyCompleted);
		} catch (error) {
			console.error("Failed to update completion status:", error);
		}
	};

	const completed = isCompleted(postId);
	const isUpdating = isLoading;

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleToggleCompletion}
						disabled={isUpdating}
						className={cn(
							"w-12 h-12 rounded-full p-0 bg-background border shadow-lg hover:bg-muted",
							completed && "border-green-500",
							className,
						)}
					>
						<CheckIcon
							className={cn(
								"w-5 h-5 text-muted-foreground",
								completed && "text-green-500",
							)}
						/>
					</Button>
				</TooltipTrigger>
				<TooltipContent side={tooltipSide}>
					{completed ? "Mark as incomplete" : "Mark as complete"}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
