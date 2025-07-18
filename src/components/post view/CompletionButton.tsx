"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "../ui/button";
import { CheckIcon } from "lucide-react";
import { useCompletionStatus } from "@/hooks/useCompletionStatus";

export const CompletionButton = ({
	postId,
	className,
}: { postId: string; className?: string }) => {
	const { isCompleted, updateCompletionStatus, isLoading } =
		useCompletionStatus([postId]);

	const handleToggleCompletion = async () => {
		if (isUpdating) return;
		try {
			// Use the current completed state to determine the new state
			const currentlyCompleted = isCompleted(postId);
			await updateCompletionStatus(postId, !currentlyCompleted);
		} catch (error) {
			console.error("Failed to update completion status:", error);
		}
	};

	const completed = isCompleted(postId);
	const isUpdating = isLoading;
	return (
		<div className={cn(className)}>
			{completed ? (
				<Button
					variant="outline"
					className="text-green-600 border-green-600 hover:bg-green-50"
					onClick={handleToggleCompletion}
				>
					<CheckIcon className="w-4 h-4" />
					<span className="font-semibold">Completed</span>
				</Button>
			) : (
				<Button onClick={handleToggleCompletion} variant="outline">
					<CheckIcon className="w-4 h-4" />
					<span>Mark Complete</span>
				</Button>
			)}
		</div>
	);
};
