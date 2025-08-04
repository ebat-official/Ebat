"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "../ui/button";
import { CheckIcon } from "lucide-react";
import { useCompletionStatus } from "@/hooks/useCompletionStatus";
import { useAuthAction } from "@/hooks/useAuthAction";
import { toast } from "sonner";
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

	const { executeAction, renderLoginModal } = useAuthAction({
		requireAuth: true,
		authMessage: "Please sign in to mark posts as complete",
		onSuccess: () => {
			// Success is handled by the store's optimistic updates
		},
		onError: (error) => {
			console.error("Failed to update completion status:", error);
			toast.error("Failed to update completion status");
		},
	});

	const handleToggleCompletion = async () => {
		if (isLoading) return;

		const currentlyCompleted = isCompleted(postId);
		await executeAction(async () => {
			await updateCompletionStatus(postId, !currentlyCompleted);
		});
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
			{renderLoginModal()}
		</TooltipProvider>
	);
};
