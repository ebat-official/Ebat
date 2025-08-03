"use client";
import { useBookmark } from "@/hooks/useBookmark";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LuBookmarkPlus, LuBookmarkMinus } from "react-icons/lu";
import { FC } from "react";

interface BookmarkBadgeProps {
	postId: string;
	className?: string;
}

export const BookmarkBadge: FC<BookmarkBadgeProps> = ({
	postId,
	className,
}) => {
	const { isBookmarked, isLoading, isUpdating, toggleBookmark } =
		useBookmark(postId);

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		toggleBookmark();
	};

	if (isLoading) {
		return (
			<Button
				variant="ghost"
				size="icon"
				className={cn("rounded-full", className)}
				disabled
			>
				<LuBookmarkPlus className="animate-pulse" size={18} />
			</Button>
		);
	}

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className={cn(
							"rounded-full transition-colors",
							isBookmarked && "text-blue-500 hover:text-blue-600",
							isUpdating && "animate-pulse",
							className,
						)}
						onClick={handleClick}
						disabled={isUpdating}
					>
						{isBookmarked ? (
							<LuBookmarkMinus size={22} />
						) : (
							<LuBookmarkPlus size={22} />
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent side="right">
					<span>
						{isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
					</span>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
