"use client";

import { Button } from "@/components/ui/button";
import { generatePostPath } from "@/utils/generatePostPath";
import { shareToPlatform, type ShareData } from "@/utils/shareUtils";
import { PostWithExtraDetails, FeedPost } from "@/utils/types";
import { useEffect, useState, useCallback } from "react";
import { FaLinkedin, FaTwitter, FaWhatsapp, FaCopy } from "react-icons/fa";
import { LuShare2 } from "react-icons/lu";
import { toast } from "sonner";

interface ShareButtonProps {
	post: PostWithExtraDetails | FeedPost;
	className?: string;
	tooltipSide?: "left" | "right" | "top" | "bottom";
	onClick?: (e: React.MouseEvent) => void;
}

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
		<div className="absolute left-0 top-[20px] rotate-[150deg] w-24 h-24 translate-x-1/2 -translate-y-full z-50">
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

export const ShareButton: React.FC<ShareButtonProps> = ({
	post,
	className = "w-12 h-12 rounded-full p-0 bg-background border shadow-lg hover:bg-muted",
	onClick,
}) => {
	const [showShareRadial, setShowShareRadial] = useState(false);

	//   Click outside handler for share radial menu
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element;
			if (showShareRadial && !target.closest(".share-radial-container")) {
				setShowShareRadial(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showShareRadial]);

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

	const handleToggleShareRadial = (e: React.MouseEvent) => {
		setShowShareRadial(!showShareRadial);
		onClick?.(e);
	};
	return (
		<div className="relative share-radial-container">
			<Button
				variant="ghost"
				size="sm"
				onClick={handleToggleShareRadial}
				className={className}
			>
				<LuShare2 className="w-5 h-5 text-muted-foreground" />
			</Button>

			<RadialShareMenu
				isVisible={showShareRadial}
				onShare={handleShare}
				onCopyUrl={handleCopyUrl}
			/>
		</div>
	);
};
