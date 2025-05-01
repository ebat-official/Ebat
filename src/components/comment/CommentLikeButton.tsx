import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { TbTriangle } from "react-icons/tb";
import { VoteType } from "@prisma/client";
import { useSession } from "next-auth/react";
import { handleError } from "@/utils/handleError";
import { UNAUTHENTICATED_ERROR } from "@/utils/errors";
import { toast } from "@/hooks/use-toast";
import { formatNumInK } from "@/utils/formatNumInK";
import { CommentVoteAction } from "@/actions/commentVoting";
import { useServerAction } from "@/hooks/useServerAction";
import LoginModal from "../auth/LoginModal";
import { cn } from "@/lib/utils";

function CommentLikeButton({ commentId }: { commentId: string }) {
	const [currentVoteType, setCurrentVoteType] = useState<VoteType | null>(null);
	const [voteCount, setVoteCount] = useState(0);
	const [createVoteAction, isLoading] = useServerAction(CommentVoteAction);
	const [loginModalMessage, setLoginModalMessage] = useState<string>("");
	const { data: session } = useSession();

	const voteHandler = async (type: VoteType) => {
		if (isLoading) return;
		if (!session) {
			setLoginModalMessage("Sign in to add a vote.");
			return;
		}
		const previousVoteType = currentVoteType;
		const previousVoteCount = voteCount;

		try {
			if (currentVoteType === type) {
				setCurrentVoteType(null);
				setVoteCount((prev) => (type === VoteType.UP ? prev - 1 : prev + 1));
				await createVoteAction({ commentId, type: null });
			} else {
				setCurrentVoteType(type);
				setVoteCount((prev) => (type === VoteType.UP ? prev + 1 : prev - 1));
				await createVoteAction({ commentId, type });
			}
		} catch (error) {
			setCurrentVoteType(previousVoteType);
			setVoteCount(previousVoteCount);
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
			<div>
				<Card className="flex  py-0 w-fit">
					<CardContent className=" flex justify-center items-center py-1 px-2 gap-1">
						<button type="button" onClick={() => voteHandler(VoteType.UP)}>
							<TbTriangle
								size={12}
								className={cn(
									currentVoteType === VoteType.UP
										? "fill-gray-500 stroke-gray-500"
										: "fill-none stroke-gray-500",
								)}
							/>
						</button>
						<span className="text-xs">{formatNumInK(voteCount)}</span>

						<button type="button" onClick={() => voteHandler(VoteType.DOWN)}>
							<TbTriangle
								size={12}
								className={cn(
									"rotate-180",
									currentVoteType === VoteType.DOWN
										? "fill-gray-500 stroke-gray-500"
										: "fill-none stroke-gray-500",
								)}
							/>
						</button>
					</CardContent>
				</Card>
			</div>
		</>
	);
}

export default CommentLikeButton;
