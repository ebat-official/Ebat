"use client";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateEditPath } from "@/utils/generateEditPath";
import { PostWithExtraDetails } from "@/utils/types";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaComments, FaEllipsisH } from "react-icons/fa";
import { BookmarkBadge } from "@/components/shared/BookmarkBadge";
import { CompletionButton } from "./CompletionButton";
import { ShareButton } from "@/components/shared/ShareButton";

interface FloatingActionBarProps {
	post: PostWithExtraDetails;
	className?: string;
}

// Reusable button component to reduce duplication
interface ActionButtonProps {
	icon: React.ReactNode;
	onClick: () => void;
	tooltip: string;
	tooltipSide?: "left" | "right";
	className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
	icon,
	onClick,
	tooltip,
	tooltipSide = "right",
	className = "w-12 h-12 rounded-full p-0 bg-background border shadow-lg hover:bg-muted",
}) => (
	<TooltipProvider>
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					onClick={onClick}
					className={className}
				>
					{icon}
				</Button>
			</TooltipTrigger>
			<TooltipContent side={tooltipSide}>{tooltip}</TooltipContent>
		</Tooltip>
	</TooltipProvider>
);

export default function FloatingActionBar({
	post,
	className,
}: FloatingActionBarProps) {
	const [showComments, setShowComments] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const router = useRouter();

	// Check if URL has #comments hash
	useEffect(() => {
		if (typeof window !== "undefined") {
			setShowComments(window.location.hash === "#comments");
		}
	}, []);

	// Click outside handler for mobile expanded menu
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element;

			// Handle mobile expanded menu
			if (isExpanded) {
				const mobileContainer = target.closest(".mobile-floating-action");
				if (!mobileContainer) {
					setIsExpanded(false);
				}
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isExpanded]);

	const handleEdit = useCallback(() => {
		const editPath = generateEditPath({
			category: post.category,
			subCategory: post.subCategory,
			postType: post.type,
			postId: post.id,
			approvalStatus: post.approvalStatus,
		});
		router.push(editPath);
	}, [post, router]);

	const handleComments = useCallback(() => {
		const commentsSection = document.getElementById("comments");
		if (commentsSection) {
			commentsSection.scrollIntoView({ behavior: "smooth" });
		}
	}, []);

	const handleToggleExpanded = useCallback(() => {
		setIsExpanded(!isExpanded);
	}, [isExpanded]);

	// Common button styles
	const buttonClassName =
		"w-12 h-12 rounded-full p-0 bg-background border shadow-lg hover:bg-muted";
	const mobileButtonClassName =
		"w-14 h-14 rounded-full p-0 bg-background border shadow-lg hover:bg-muted z-50 relative";

	return (
		<>
			{/* Mobile: Single expandable button */}
			<div className="mobile-floating-action lg:hidden fixed bottom-8 left-4 z-50">
				<div
					className={`relative transition-all duration-300 ${isExpanded ? "scale-100" : "scale-100"}`}
				>
					{/* Main toggle button */}
					<Button
						variant="ghost"
						size="sm"
						onClick={handleToggleExpanded}
						className={mobileButtonClassName}
					>
						<FaEllipsisH
							className={`w-6 h-6 text-muted-foreground transition-transform duration-300 ${isExpanded ? "rotate-90" : "rotate-0"}`}
						/>
					</Button>

					{/* Expanded options */}
					<div
						className={`absolute bottom-16 right-0 flex flex-col gap-3 transition-all duration-300 ${isExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
					>
						{/* Completion Button */}
						<CompletionButton postId={post.id} tooltipSide="left" />

						{/* Bookmark Button */}
						<BookmarkBadge postId={post.id} className={buttonClassName} />

						{/* Edit Button */}
						<ActionButton
							icon={<FaEdit className="w-5 h-5 text-muted-foreground" />}
							onClick={handleEdit}
							tooltip="Suggest an edit"
							tooltipSide="left"
							className={buttonClassName}
						/>

						{/* Comments Button */}
						{/* <ActionButton
							icon={<FaComments className="w-5 h-5 text-muted-foreground" />}
							onClick={handleComments}
							tooltip="View comments"
							tooltipSide="left"
							className={buttonClassName}
						/> */}

						{/* Share Button */}
						<ShareButton
							post={post}
							className={buttonClassName}
							tooltipSide="left"
						/>
					</div>
				</div>
			</div>

			{/* Desktop: Original layout */}
			<div
				className={`floating-action-container hidden lg:flex flex-col gap-2 ${className}`}
			>
				{/* Completion Button */}
				<CompletionButton postId={post.id} tooltipSide="right" />

				{/* Bookmark Button */}
				<BookmarkBadge postId={post.id} className={buttonClassName} />

				{/* Edit Button */}
				<ActionButton
					icon={<FaEdit className="w-5 h-5 text-muted-foreground" />}
					onClick={handleEdit}
					tooltip="Suggest an edit"
					tooltipSide="right"
					className={buttonClassName}
				/>

				{/* Comments Button */}
				{/* <ActionButton
					icon={<FaComments className="w-5 h-5 text-muted-foreground" />}
					onClick={handleComments}
					tooltip="View comments"
					tooltipSide="right"
					className={buttonClassName}
				/> */}

				{/* Share Button */}
				<ShareButton
					post={post}
					className={buttonClassName}
					tooltipSide="right"
				/>
			</div>
		</>
	);
}
