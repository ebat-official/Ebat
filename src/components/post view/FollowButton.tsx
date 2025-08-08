"use client";
import { followAction, isFollowing } from "@/actions/follow";
import { useServerAction } from "@/hooks/useServerAction";
import { toast } from "@/hooks/use-toast";
import React, { useEffect, useState } from "react";
import { FollowAction } from "@/db/schema";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthAction } from "@/hooks/useAuthAction";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { CiCirclePlus } from "react-icons/ci";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
	authorId: string;
	currentUserId?: string;
	className?: string;
	iconClassName?: string;
	showTooltip?: boolean;
}

const FollowButton: React.FC<FollowButtonProps> = ({
	authorId,
	currentUserId,
	className,
	iconClassName,
	showTooltip = true,
}) => {
	const [isFollowingState, setIsFollowingState] = useState<boolean>(false);
	const [loading, setLoading] = useState(false);
	const [runFollowAction] = useServerAction(followAction);
	const { executeAction, renderLoginModal } = useAuthAction({
		requireAuth: true,
		authMessage: "Please sign in to follow users.",
	});

	useEffect(() => {
		async function fetchIsFollowing() {
			if (!currentUserId) return;
			const following = await isFollowing(authorId);
			setIsFollowingState(following);
		}
		fetchIsFollowing();
	}, [authorId, currentUserId]);

	const handleClick = () => {
		executeAction(async () => {
			setLoading(true);
			const prev = isFollowingState;
			setIsFollowingState(!prev); // optimistic update
			try {
				const action = prev ? FollowAction.UNFOLLOW : FollowAction.FOLLOW;
				const res = await runFollowAction({ followedUserId: authorId, action });
				if (res.status !== "success") {
					setIsFollowingState(prev); // rollback
					toast({
						description: res.data?.message || "Action failed",
						variant: "destructive",
					});
				}
			} catch (e) {
				setIsFollowingState(prev); // rollback
				toast({ description: "Something went wrong", variant: "destructive" });
			} finally {
				setLoading(false);
			}
		});
	};

	const buttonContent = (
		<button
			type="button"
			onClick={handleClick}
			disabled={loading}
			aria-label={isFollowingState ? "Unfollow" : "Follow"}
			className={cn("cursor-pointer", className)}
		>
			{isFollowingState ? (
				<IoIosCheckmarkCircleOutline
					className={cn("w-4 h-4 text-blue-400", iconClassName)}
				/>
			) : (
				<CiCirclePlus
					className={cn("w-4 h-4 text-violet-400", iconClassName)}
				/>
			)}
		</button>
	);

	if (!showTooltip) {
		return (
			<>
				{buttonContent}
				{renderLoginModal()}
			</>
		);
	}

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
				<TooltipContent side="top">
					{isFollowingState ? "Following" : "Follow"}
				</TooltipContent>
			</Tooltip>
			{renderLoginModal()}
		</TooltipProvider>
	);
};

export default FollowButton;
