"use client";
import { followAction, isFollowing } from "@/actions/follow";
import { Button } from "@/components/ui/button";
import { useServerAction } from "@/hooks/useServerAction";
import { toast } from "@/hooks/use-toast";
import { SlUserFollow, SlUserFollowing } from "react-icons/sl";
import React, { useEffect, useState } from "react";
import { FollowAction } from "@/db/schema";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthAction } from "@/hooks/useAuthAction";

interface FollowButtonProps {
	authorId: string;
	currentUserId?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({
	authorId,
	currentUserId,
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

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleClick}
						disabled={loading}
						aria-label={isFollowingState ? "Unfollow" : "Follow"}
						className="p-1"
					>
						{isFollowingState ? (
							<SlUserFollowing className="w-4 h-4 text-blue-500" />
						) : (
							<SlUserFollow className="w-4 h-4 text-gray-500" />
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent side="top">
					{isFollowingState ? "Following" : "Follow"}
				</TooltipContent>
			</Tooltip>
			{renderLoginModal()}
		</TooltipProvider>
	);
};

export default FollowButton;
