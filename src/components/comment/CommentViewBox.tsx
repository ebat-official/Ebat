"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { CommentWithVotes } from "@/utils/types";
import { FaChevronUp, FaRegCommentDots } from "react-icons/fa";
import CommentLikeButton from "./CommentLikeButton";
import { CommentActionButton } from "./CommentActionButton";
import CommentAddBox from "./CommentAddBox";

type CommentViewBoxProps = {
	comment: CommentWithVotes;
	postId: string;
	depth?: number;
};
export function CommentViewBox({
	comment,
	postId,
	depth = 1,
}: CommentViewBoxProps) {
	const {
		id,
		author,
		content: initialContent,
		createdAt,
		replies: initialReplies = [],
	} = comment;
	const [isReplying, setIsReplying] = useState(false);
	const [replies, setReplies] = useState<CommentWithVotes[]>(initialReplies);
	const [areRepliesExpanded, setAreRepliesExpanded] = useState(true);
	const [isEditMode, setIsEditMode] = useState(false);
	const [content, setContent] = useState(initialContent);

	useEffect(() => {
		setContent(initialContent);
	}, [initialContent]);

	const toggleReplies = () => {
		setAreRepliesExpanded((prev) => !prev);
	};

	const commentAddHandler = (comment: CommentWithVotes) => {
		setReplies((prev) => [comment, ...prev]);
		setIsReplying(false);
	};

	return (
		<Card className=" shadow-none border-0 py-0 pt-6 w-full">
			<CardContent className="p-0">
				<div className="flex items-stretch">
					<div className=" flex  relative flex-col justify-between items-center w-4 md:w-8  lg:w-10 pb-1">
						<Avatar className="relative min-w-6 flex h-auto w-auto aspect-square shrink-0 overflow-hidden rounded-full z-10">
							<AvatarImage
								className="size-full object-cover"
								src={author?.image || undefined}
								alt="avatar"
								referrerPolicy="no-referrer"
							/>
							<AvatarFallback className="flex size-full items-center justify-center">
								{author?.userName.charAt(0)}
							</AvatarFallback>
						</Avatar>
						{areRepliesExpanded && replies.length > 0 && (
							<div className="w-[1px] h-full bg-gray-200 dark:bg-gray-800 absolute top-0  left-1/2 -translate-x-1/2" />
						)}
						{replies.length > 0 && (
							<button type="button" onClick={toggleReplies} className="z-10">
								<motion.div
									className="w-4 h-4 rounded-full bg-foreground/10 flex justify-between items-center p-1 mb-2"
									animate={{
										rotate: areRepliesExpanded ? 0 : 180,
									}}
									transition={{
										duration: 0.3,
										ease: "easeInOut",
									}}
								>
									<FaChevronUp />
								</motion.div>
							</button>
						)}
					</div>

					<div className="flex flex-col gap-2 w-full px-2 sm:p-2  ">
						{/* Header with author and timestamp */}
						<div className="flex items-center gap-2">
							<h4 className="font-semibold">{author?.userName}</h4>
							<span className="text-sm text-muted-foreground hidden md:block">
								{formatDistanceToNow(new Date(createdAt))} ago
							</span>
						</div>

						{/* Comment content */}
						{isEditMode ? (
							<CommentAddBox
								commentId={id}
								postId={postId}
								parentId={id}
								cancelHandler={() => setIsEditMode(false)}
								commentAddHandler={(comment) => {
									setContent(comment.content);
									setIsEditMode(false);
								}}
								autoFocus
								editHtml={content || ""}
							/>
						) : (
							<div
								className="text-sm first-letter:capitalize lexicalContentView"
								// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
								dangerouslySetInnerHTML={{ __html: content || "" }}
							/>
						)}

						{/* Action buttons */}
						<div className="flex items-center gap-2 ">
							<CommentLikeButton comment={comment} postId={postId} />
							{depth < 3 && (
								<Button
									variant="ghost"
									size="sm"
									className="gap-1 pb-0 opacity-80"
									onClick={() => setIsReplying(!isReplying)}
								>
									<FaRegCommentDots />
									Reply
								</Button>
							)}
							<CommentActionButton
								commentId={id}
								editModeHandler={() => {
									setIsEditMode((prev) => !prev);
								}}
							/>
						</div>

						{/* Reply form */}
						<AnimatePresence>
							{isReplying && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									transition={{
										duration: 0.3,
										ease: "easeInOut",
									}}
									className="mt-3 space-y-2"
								>
									<CommentAddBox
										postId={postId}
										parentId={id}
										cancelHandler={() => setIsReplying(false)}
										commentAddHandler={commentAddHandler}
										autoFocus
									/>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>

				{/* Nested replies - conditionally rendered */}
				<AnimatePresence>
					{areRepliesExpanded && replies.length > 0 && (
						<motion.div
							className="replies flex flex-col"
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{
								duration: 0.3,
								ease: "easeInOut",
							}}
						>
							{replies.map((reply, indx) => (
								<div className="flex" key={reply.id}>
									<div
										aria-hidden="true"
										className="thread flex justify-end items-start relative w-4 md:w-8  lg:w-10"
									>
										<div className="box-border relative border-gray-200 dark:border-gray-800  h-10 border-0  border-solid border-b cursor-pointer w-[calc(50%+0.5px)] border-l rounded-bl-lg" />

										{replies.length > 1 && indx !== replies.length - 1 && (
											<div className="w-[1px] h-full bg-gray-200 dark:bg-gray-800 absolute top-0  left-1/2 -translate-x-1/2" />
										)}
									</div>

									<CommentViewBox
										comment={reply}
										postId={postId}
										depth={depth + 1}
									/>
								</div>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			</CardContent>
		</Card>
	);
}
