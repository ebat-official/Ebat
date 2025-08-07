import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { PostApprovalStatus } from "@/db/schema/enums";
import { generatePostPath } from "@/utils/generatePostPath";
import { shareToPlatform } from "@/utils/shareUtils";
import { PostType, PostCategory, SubCategory } from "@/db/schema/enums";
import { POST_ACTIONS } from "@/utils/constants";
import { PostActions } from "@/utils/types";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-transition-progress/next";
import {
	FaCheck,
	FaCopy,
	FaLinkedin,
	FaTwitter,
	FaTelegram,
	FaWhatsapp,
	FaEnvelope,
	FaComments,
	FaTimes,
} from "react-icons/fa";
import { useReward } from "react-rewards";
import { toast } from "sonner";

interface PostPublishedModalProps {
	postData: {
		id: string;
		slug: string;
		approvalStatus: PostApprovalStatus;
		title: string;
		category: PostCategory;
		subCategory: SubCategory;
		postType: PostType;
	};
	action: PostActions;
	onClose?: () => void;
	allowOutsideClick?: boolean;
	enableAnimation?: boolean;
	category: string;
}

const PostPublishedModal: React.FC<PostPublishedModalProps> = ({
	postData,
	action,
	onClose,
	allowOutsideClick = false,
	enableAnimation = true,
	category,
}) => {
	const isApproved = postData.approvalStatus === PostApprovalStatus.APPROVED;
	const hasAnimated = useRef(false);
	const { reward: confettiReward, isAnimating: isConfettiAnimating } =
		useReward("rewardId", "confetti");

	useEffect(() => {
		if (enableAnimation && !isConfettiAnimating && !hasAnimated.current) {
			hasAnimated.current = true;
			setTimeout(() => {
				confettiReward();
			});
		}
	}, [enableAnimation, confettiReward, isConfettiAnimating]);

	const postUrl = generatePostPath({
		category: postData.category,
		subCategory: postData.subCategory,
		slug: postData.slug,
		id: postData.id,
		postType: postData.postType,
	});

	const fullUrl = `${window.location.origin}${postUrl}`;

	const handleCopyUrl = async () => {
		try {
			await navigator.clipboard.writeText(fullUrl);
			toast.success("URL copied to clipboard!");
		} catch (error) {
			toast.error("Failed to copy URL");
		}
	};

	const handleShare = (
		platform: "twitter" | "linkedin" | "telegram" | "whatsapp" | "email",
	) => {
		shareToPlatform(platform, {
			title: postData.title,
			url: fullUrl,
			postType: postData.postType,
		});
	};

	const handleClose = () => {
		// Close modal - navigation will be handled by Link component
		if (onClose) {
			onClose();
		}
	};

	const handleViewStatus = () => {
		// Close modal - navigation will be handled by Link component
		if (onClose) {
			onClose();
		}
	};

	// If not approved, show the simple status dialog
	if (!isApproved) {
		return (
			<Dialog modal={!allowOutsideClick} open onOpenChange={handleClose}>
				<DialogContent
					showCloseButton={false}
					className="max-w-sm p-6 text-white border-none rounded-lg bg-linear-to-br from-gray-800 to-black"
				>
					<DialogHeader
						id="rewardId"
						className="absolute top-0 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 left-1/2"
					>
						<div className="relative">
							<div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-40" />
							<div className="bg-blue-500 rounded-full p-4 flex justify-center items-center shadow-[0px_10px_30px_rgba(59,130,246,0.5)]">
								<FaCheck className="w-14 h-14 text-white" />
							</div>
						</div>
					</DialogHeader>

					<div className="flex flex-col gap-4 mt-8">
						<h2 className="mt-4 text-lg font-bold text-center">
							Post Published
						</h2>
						<p className="font-medium text-center text-gray-300">
							{action === POST_ACTIONS.CREATE
								? "Your post has been published and sent for approval"
								: "Your post edit has been sent for approval"}
						</p>
						<div className="flex gap-3 mt-4">
							<Link href={`/${category}`} className="flex-1">
								<Button
									className="w-full bg-gray-600 hover:bg-gray-700 text-white"
									onClick={handleClose}
								>
									Go back to home
								</Button>
							</Link>
							<Link href="/settings/posts" className="flex-1">
								<Button
									className="w-full blue-gradient text-white"
									onClick={handleViewStatus}
								>
									View Status
								</Button>
							</Link>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	// If approved, show the share modal
	return (
		<Dialog modal={!allowOutsideClick} open onOpenChange={handleClose}>
			<DialogContent showCloseButton={false} className="max-w-md p-0">
				{/* Confetti Reward Header */}
				<DialogHeader
					id="rewardId"
					className="absolute top-0 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 left-1/2"
				/>

				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b">
					<h2 className="text-lg font-semibold">Share with</h2>
					<Link href={`/${category}`}>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleClose}
							className="h-auto p-0"
						>
							<FaTimes className="w-5 h-5" />
						</Button>
					</Link>
				</div>

				{/* Share via Apps */}
				<div className="p-6 space-y-8">
					<div className="flex justify-between items-center">
						{/* LinkedIn */}
						<div className="flex flex-col items-center">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleShare("linkedin")}
								className="w-14 h-14 rounded-full p-0 mb-2 bg-muted hover:bg-muted/80"
							>
								<FaLinkedin className="w-7 h-7" />
							</Button>
							<span className="text-xs text-muted-foreground">LinkedIn</span>
						</div>

						{/* Telegram */}
						<div className="flex flex-col items-center">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleShare("telegram")}
								className="w-14 h-14 rounded-full p-0 mb-2 bg-muted hover:bg-muted/80"
							>
								<FaTelegram className="w-7 h-7" />
							</Button>
							<span className="text-xs text-muted-foreground">Telegram</span>
						</div>

						{/* Twitter */}
						<div className="flex flex-col items-center">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleShare("twitter")}
								className="w-14 h-14 rounded-full p-0 mb-2 bg-muted hover:bg-muted/80"
							>
								<FaTwitter className="w-7 h-7" />
							</Button>
							<span className="text-xs text-muted-foreground">Twitter</span>
						</div>

						{/* WhatsApp */}
						<div className="flex flex-col items-center">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleShare("whatsapp")}
								className="w-14 h-14 rounded-full p-0 mb-2 bg-muted hover:bg-muted/80"
							>
								<FaWhatsapp className="w-7 h-7" />
							</Button>
							<span className="text-xs text-muted-foreground">Whatsapp</span>
						</div>

						{/* Email */}
						<div className="flex flex-col items-center">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleShare("email")}
								className="w-14 h-14 rounded-full p-0 mb-2 bg-muted hover:bg-muted/80"
							>
								<FaEnvelope className="w-7 h-7" />
							</Button>
							<span className="text-xs text-muted-foreground">E-mail</span>
						</div>
					</div>

					{/* Share with Link */}
					<p className="text-sm text-muted-foreground text-center font-bold">
						Or share with link
					</p>
					<div className="mt-6 text-center">
						<div className="flex items-center gap-2 w-full">
							<input
								type="text"
								value={fullUrl}
								readOnly
								className="flex-1 px-3 py-2 border rounded-md text-sm bg-background text-center text-muted-foreground"
							/>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleCopyUrl}
								className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-md"
							>
								<FaCopy className="w-5 h-5" />
							</Button>
						</div>
					</div>

					{/* View Status Button */}
					<div className="mt-6">
						<Link href="/settings/posts" className="w-full">
							<Button
								className="w-full blue-gradient text-white"
								onClick={handleViewStatus}
							>
								View Status
							</Button>
						</Link>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default PostPublishedModal;
