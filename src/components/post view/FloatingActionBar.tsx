"use client";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateEditPath } from "@/utils/generateEditPath";
import { generatePostPath } from "@/utils/generatePostPath";
import { shareToPlatform, type ShareData } from "@/utils/shareUtils";
import { PostWithExtraDetails } from "@/utils/types";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
	FaEdit,
	FaComments,
	FaShareAlt,
	FaLinkedin,
	FaTwitter,
	FaWhatsapp,
	FaCopy,
	FaEllipsisH,
} from "react-icons/fa";
import { BookmarkBadge } from "@/components/shared/BookmarkBadge";
import { CompletionButton } from "./CompletionButton";
import { toast } from "sonner";

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

// Radial share menu component
interface RadialShareMenuProps {
	isVisible: boolean;
	onShare: (platform: "linkedin" | "twitter" | "whatsapp") => void;
	onCopyUrl: () => void;
}

const RadialShareMenu: React.FC<RadialShareMenuProps> = ({
	isVisible,
	onShare,
	onCopyUrl,
}) => {
	if (!isVisible) return null;

	return (
		<div className="absolute left-0 top-[20px] rotate-[160deg] w-24 h-24 translate-x-1/2 -translate-y-full">
			{/* LinkedIn - Top Left */}
			<Button
				variant="ghost"
				size="sm"
				onClick={() => onShare("linkedin")}
				className="absolute top-1/2 left-1/2 w-10 h-10 rounded-full p-0 bg-blue-500 hover:bg-blue-600 text-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 rotate-[calc((120deg/4)*0)]"
				style={{ transformOrigin: "300% center" }}
			>
				<FaLinkedin className="w-4 h-4 rotate-270" />
			</Button>

			{/* Twitter - Top Right */}
			<Button
				variant="ghost"
				size="sm"
				onClick={() => onShare("twitter")}
				className="absolute top-1/2 left-1/2 w-10 h-10 rounded-full p-0 bg-blue-400 hover:bg-blue-500 text-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 rotate-[calc((120deg/4)*1)]"
				style={{ transformOrigin: "300% center" }}
			>
				<FaTwitter className="w-4 h-4" />
			</Button>

			{/* WhatsApp - Bottom Left */}
			<Button
				variant="ghost"
				size="sm"
				onClick={() => onShare("whatsapp")}
				className="absolute top-1/2 left-1/2 w-10 h-10 rounded-full p-0 bg-green-500 hover:bg-green-600 text-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 rotate-[calc((120deg/4)*2)]"
				style={{ transformOrigin: "300% center" }}
			>
				<FaWhatsapp className="w-4 h-4 rotate-270" />
			</Button>

			{/* Copy - Bottom Right */}
			<Button
				variant="ghost"
				size="sm"
				onClick={onCopyUrl}
				className="absolute top-1/2 left-1/2 w-10 h-10 rounded-full p-0 bg-gray-500 hover:bg-gray-600 text-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 rotate-[calc((120deg/4)*3)]"
				style={{ transformOrigin: "300% center" }}
			>
				<FaCopy className="w-4 h-4 rotate-180" />
			</Button>
		</div>
	);
};

export default function FloatingActionBar({
	post,
	className,
}: FloatingActionBarProps) {
	const [showShareRadial, setShowShareRadial] = useState(false);
	const [showComments, setShowComments] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const router = useRouter();

	// Check if URL has #comments hash
	useEffect(() => {
		if (typeof window !== "undefined") {
			setShowComments(window.location.hash === "#comments");
		}
	}, []);

	// Unified click outside handler
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element;

			// Handle share radial menu
			if (showShareRadial && !target.closest(".share-radial-container")) {
				setShowShareRadial(false);
			}

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
	}, [showShareRadial, isExpanded]);

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

	const handleShare = useCallback(
		(platform: "linkedin" | "twitter" | "whatsapp") => {
			const postUrl = generatePostPath({
				category: post.category,
				subCategory: post.subCategory,
				slug: post.slug || "",
				id: post.id,
				postType: post.type,
			});

			const fullUrl = `${window.location.origin}${postUrl}`;

			shareToPlatform(platform, {
				title: post.title,
				url: fullUrl,
				postType: post.type,
			});

			setShowShareRadial(false);
		},
		[post],
	);

	const handleCopyUrl = useCallback(async () => {
		const postUrl = generatePostPath({
			category: post.category,
			subCategory: post.subCategory,
			slug: post.slug || "",
			id: post.id,
			postType: post.type,
		});

		const fullUrl = `${window.location.origin}${postUrl}`;

		try {
			await navigator.clipboard.writeText(fullUrl);
			toast.success("URL copied to clipboard!");
		} catch (error) {
			toast.error("Failed to copy URL");
		}
		setShowShareRadial(false);
	}, [post]);

	const handleToggleExpanded = useCallback(() => {
		setIsExpanded(!isExpanded);
		if (showShareRadial) {
			setShowShareRadial(false);
		}
	}, [isExpanded, showShareRadial]);

	const handleToggleShareRadial = useCallback(() => {
		setShowShareRadial(!showShareRadial);
	}, [showShareRadial]);

	// Common button styles
	const buttonClassName =
		"w-12 h-12 rounded-full p-0 bg-background border shadow-lg hover:bg-muted";
	const mobileButtonClassName =
		"w-14 h-14 rounded-full p-0 bg-background border shadow-lg hover:bg-muted z-50 relative";

	return (
		<>
			{/* Mobile: Single expandable button */}
			<div className="mobile-floating-action lg:hidden fixed bottom-4 right-4 z-50">
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

						{/* Share Button with Radial Menu */}
						<div className="relative share-radial-container">
							<ActionButton
								icon={<FaShareAlt className="w-5 h-5 text-muted-foreground" />}
								onClick={handleToggleShareRadial}
								tooltip="Share post"
								tooltipSide="left"
								className={buttonClassName}
							/>

							<RadialShareMenu
								isVisible={showShareRadial}
								onShare={handleShare}
								onCopyUrl={handleCopyUrl}
							/>
						</div>
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

				{/* Share Button with Radial Menu */}
				<div className="relative share-radial-container">
					<ActionButton
						icon={<FaShareAlt className="w-5 h-5 text-muted-foreground" />}
						onClick={handleToggleShareRadial}
						tooltip="Share post"
						tooltipSide="right"
						className={buttonClassName}
					/>

					<RadialShareMenu
						isVisible={showShareRadial}
						onShare={handleShare}
						onCopyUrl={handleCopyUrl}
					/>
				</div>
			</div>
		</>
	);
}
