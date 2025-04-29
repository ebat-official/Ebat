"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	HiThumbUp,
	HiThumbDown,
	HiOutlineThumbUp,
	HiOutlineThumbDown,
} from "react-icons/hi";
import { VoteType } from "@prisma/client";
import { voteAction } from "@/actions/postVoting";
import { handleError } from "@/utils/handleError";
import { toast } from "@/hooks/use-toast";
import LoginModal from "../auth/LoginModal";
import { UNAUTHENTICATED_ERROR } from "@/utils/errors";
import { useSession } from "next-auth/react";
import { useServerAction } from "@/hooks/useServerAction";
import { cn } from "@/lib/utils";
import { useVotes } from "@/hooks/query/useVotes";

function PostLikeButton({ postId }: { postId: string }) {
	const [currentVoteType, setCurrentVoteType] = useState<VoteType | null>(null);
	const [voteCount, setVoteCount] = useState(0);
	const [createVoteAction, isLoading] = useServerAction(voteAction);
	const [loginModalMessage, setLoginModalMessage] = useState<string>("");
	const { data: session } = useSession();

	const { data, isLoading: isFetching, isError } = useVotes(postId);

	useEffect(() => {
		const upVotes = data?.upVotes || 0;
		const downVotes = data?.downVotes || 0;
		const totalVotes = upVotes - downVotes;
		setVoteCount(totalVotes);
	}, [data]);

	const voteHandler = async (type: VoteType) => {
		if (isLoading) return;
		if (!session) {
			setLoginModalMessage("Sign in to add a vote.");
			return;
		}
		const previousVoteType = currentVoteType;

		try {
			if (currentVoteType === type) {
				setCurrentVoteType(null);
				setVoteCount((prev) => (type === VoteType.UP ? prev - 1 : prev + 1));
				await createVoteAction({ postId, type: null });
			} else {
				setCurrentVoteType(type);
				setVoteCount((prev) => (type === VoteType.UP ? prev + 1 : prev - 1));
				await createVoteAction({ postId, type });
			}
		} catch (error) {
			setCurrentVoteType(previousVoteType);
			setVoteCount((prev) => {
				if (previousVoteType === type) {
					return type === VoteType.UP ? prev + 1 : prev - 1;
				}
				return type === VoteType.UP ? prev - 1 : prev + 1;
			});
			const errorMessage = handleError(error);
			if (errorMessage === UNAUTHENTICATED_ERROR.data.message) {
				setLoginModalMessage("Please login to add a vote.");
				return;
			}
			toast({
				description: errorMessage,
				variant: "destructive",
			});
		}
	};

	return (
		<>
			{loginModalMessage && (
				<LoginModal
					closeHandler={() => setLoginModalMessage("")}
					message={loginModalMessage}
				/>
			)}
			<div className="flex flex-col items-center  gap-1 pl-4">
				<Button
					variant="outline"
					className="p-0.5 text-xs w-7 h-7 border-[1px]"
					onClick={() => voteHandler(VoteType.UP)}
				>
					{currentVoteType === VoteType.UP ? (
						<HiThumbUp className="w-4 h-4 text-blue-500" />
					) : (
						<HiOutlineThumbUp className="w-4 h-4 text-gray-500" />
					)}
				</Button>
				<div className="text-xs  my-1">{voteCount}</div>

				<Button
					variant="outline"
					className="p-0.5 text-xs w-7 h-7 border-[1px]"
					onClick={() => voteHandler(VoteType.DOWN)}
				>
					{currentVoteType === VoteType.DOWN ? (
						<HiThumbDown className="w-4 h-4 text-red-500" />
					) : (
						<HiOutlineThumbDown className="w-4 h-4 text-gray-500" />
					)}
				</Button>
			</div>
		</>
	);
}

export default PostLikeButton;
