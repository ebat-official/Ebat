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
import { useState } from "react";

interface BookmarkBadgeProps {
	postId: string;
	className?: string;
}

export const BookmarkBadge: FC<BookmarkBadgeProps> = ({ postId, className }) => {
	// Fallback state in case the hook fails to load
	const [fallbackState, setFallbackState] = useState({
		isBookmarked: false,
		isLoading: false,
		isUpdating: false,
		toggleBookmark: () => {},
	});

	let bookmarkHook;
	try {
		bookmarkHook = useBookmark(postId);
	} catch (error) {
		console.error("Failed to load bookmark hook:", error);
		bookmarkHook = fallbackState;
	}

	const { isBookmarked, isLoading, isUpdating, toggleBookmark } = bookmarkHook || fallbackState;

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (toggleBookmark) {
			toggleBookmark();
		}
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
							className
						)}
						onClick={handleClick}
						disabled={isUpdating}
					>
						{isBookmarked ? (
							<LuBookmarkMinus size={18} />
						) : (
							<LuBookmarkPlus size={18} />
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<span>
						{isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
					</span>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}; 