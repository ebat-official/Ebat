"use client";
import { followAction, isFollowing } from "@/actions/follow";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useServerAction } from "@/hooks/useServerAction";
import { toast } from "@/hooks/use-toast";
import { SlUserFollow, SlUserFollowing } from "react-icons/sl";
import React, { useEffect, useState } from "react";
import { FollowAction } from "@/db/schema";

interface FollowButtonProps {
	authorId: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({ authorId }) => {
	const { data: session } = useSession();
	const [isFollowingState, setIsFollowingState] = useState<boolean>(false);
	const [loading, setLoading] = useState(false);
	const [runFollowAction] = useServerAction(followAction);

	useEffect(() => {
		async function fetchIsFollowing() {
			const following = await isFollowing(authorId);
			setIsFollowingState(following);
		}
		fetchIsFollowing();
	}, [authorId]);

	const handleClick = async () => {
		if (loading) return;
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
	};

	return (
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
	);
};

export default FollowButton;
