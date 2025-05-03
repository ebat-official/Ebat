"use client";
import { useRef, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { FaRegCommentDots } from "react-icons/fa";
import { SerializedEditorState } from "lexical";
import { MentionData } from "../shared/Lexical Editor/plugins/MentionPlugin/MentionChangePlugin";
import { useServerAction } from "@/hooks/useServerAction";
import { emptyEditorState } from "../shared/Lexical Editor/constants";
import LoginModal from "@/components/auth/LoginModal";
import { toast } from "@/hooks/use-toast";
import { UNAUTHENTICATED_ERROR } from "@/utils/errors";
import { handleError } from "@/utils/handleError";
import { IoMdClose } from "react-icons/io";
import { CommentWithVotes } from "@/utils/types";
import { createEditComment } from "@/actions/comment";

const Editor = dynamic(() => import("./CommentEditor"), {
	ssr: false,
	loading: () => <Skeleton className="w-full h-28 " />,
});

interface CommentAddBoxProps {
	content?: string;
	parentId?: string | undefined;
	commentId?: string | undefined;
	postId: string;
	cancelHandler?: () => void;
	commentAddHandler?: (comment: CommentWithVotes) => void;
	autoFocus?: boolean;
	editHtml?: string;
}

export default function CommentAddBox({
	content,
	parentId = undefined,
	commentId = undefined,
	postId,
	cancelHandler,
	commentAddHandler,
	autoFocus,
	editHtml,
}: CommentAddBoxProps) {
	const [comment, setComment] = useState<SerializedEditorState>();
	const [mentions, setMentions] = useState<MentionData[]>([]);
	const [createCommentAction, isLoading] = useServerAction(createEditComment);
	const [loginModalMessage, setLoginModalMessage] = useState<string>("");
	const editorRef = useRef<{ clearEditorContent: () => void } | undefined>(
		undefined,
	);
	const commentData = {
		id: commentId,
		parentId: parentId,
		postId: postId,
		content: comment,
		mentions: mentions,
	};
	const createCommentHandler = async () => {
		try {
			if (!comment || !postId) {
				toast({
					description: "Comment content or post ID is missing.",
					variant: "destructive",
				});
				return;
			}

			const newComment = await createCommentAction(commentData);
			if (editorRef.current) {
				//@ts-ignore
				editorRef.current.clearEditorContent?.(); // Call the clearEditorContent function
			}
			if (commentAddHandler) commentAddHandler(newComment);
			// Show success toast
			toast({
				title: "Comment Added",
				description: "Your comment has been added successfully.",
				variant: "default",
			});
		} catch (error) {
			const errorMessage = handleError(error);

			// Handle authentication error
			if (errorMessage === UNAUTHENTICATED_ERROR.data.message) {
				setLoginModalMessage("Please sign in to add a comment.");
				return;
			}

			// Fallback for unknown errors
			toast({
				description: errorMessage,
				variant: "destructive",
			});
		}
	};
	return (
		<div>
			{loginModalMessage && (
				<LoginModal
					closeHandler={() => setLoginModalMessage("")}
					message={loginModalMessage}
				/>
			)}
			<Card className="pb-2 px-2">
				<CardContent className="pl-2 px-0 relative">
					<Editor
						id={parentId}
						onChangeHandler={setComment}
						onMentionChangeHandler={setMentions}
						content={content}
						ref={editorRef}
						autoFocus={autoFocus}
						editHtml={editHtml}
					/>
					<div className="absolute right-0 bottom-0 flex gap-2">
						{cancelHandler && (
							<>
								<Button
									className="hidden sm:block"
									variant="link"
									onClick={cancelHandler}
								>
									Cancel
								</Button>
								<Button
									className="sm:hidden rounded-full"
									variant="outline"
									onClick={cancelHandler}
								>
									<IoMdClose />
								</Button>
							</>
						)}
						<Button
							disabled={isLoading}
							onClick={createCommentHandler}
							variant="outline"
							className="rounded-full "
						>
							{isLoading ? (
								<Loader2 className="animate-spin" />
							) : (
								<FaRegCommentDots />
							)}
							<span className="hidden md:block font-semibold">Comment</span>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
