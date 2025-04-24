"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import {
	ThumbsUp,
	ThumbsDown,
	Reply,
	ChevronDown,
	ChevronUp,
} from "lucide-react";
import { CommentWithVotes } from "@/utils/types";
import CommentEditBox from "./CommentEditBox";
import { FaCircleChevronUp } from "react-icons/fa6";
import { FaChevronUp } from "react-icons/fa";

type CommentViewBoxProps = {
	comment: CommentWithVotes;
	postId: string;
};
export function CommentViewBox({ comment, postId }: CommentViewBoxProps) {
	const {
		id,
		author,
		content,
		createdAt,
		likes,
		dislikes,
		replies: initialReplies = [],
	} = comment;
	const [isReplying, setIsReplying] = useState(false);
	const [replyContent, setReplyContent] = useState("");
	const [replies, setReplies] = useState<CommentWithVotes[]>(initialReplies);
	const [areRepliesExpanded, setAreRepliesExpanded] = useState(true);
	const handleReplySubmit = () => {
		if (replyContent.trim()) {
			//   const newReply = {
			//     id: `reply-${Date.now()}`,
			//     author: {
			//       name: "You",
			//       image: "",
			//     },
			//     content: replyContent,
			//     createdAt: new Date().toISOString(),
			//     likes: 0,
			//     dislikes: 0,
			//   };

			//   setReplies((prev) => [...prev, newReply]);
			setReplyContent("");
			setIsReplying(false);
			// Auto-expand when adding a new reply
			if (!areRepliesExpanded) setAreRepliesExpanded(true);
		}
	};

	const toggleReplies = () => {
		setAreRepliesExpanded((prev) => !prev);
	};

	return (
		<Card className=" shadow-none border-0 py-0 pt-8 w-full">
			<CardContent className="p-0">
				<div className="flex items-stretch">
					<div className=" flex  relative flex-col justify-between items-center w-10">
						<Avatar className="h-10 z-10">
							<AvatarImage
								src={author?.image || undefined}
								alt="avatar"
								referrerPolicy="no-referrer"
							/>
							<AvatarFallback>{author?.userName.charAt(0)}</AvatarFallback>
						</Avatar>
						{areRepliesExpanded && replies.length > 0 && (
							<div className="w-[1px] h-full bg-gray-200 dark:bg-gray-800 absolute top-0  left-1/2 -translate-x-1/2" />
						)}
						{replies.length > 0 && (
							<button
								type="button"
								onClick={() => setAreRepliesExpanded((prev) => !prev)}
								className="z-10"
							>
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

					<div className="flex flex-col gap-2 w-full">
						{/* Header with author and timestamp */}
						<div className="flex items-center gap-2">
							<h4 className="font-semibold">{author?.userName}</h4>
							<span className="text-sm text-muted-foreground">
								{formatDistanceToNow(new Date(createdAt))} ago
							</span>
						</div>

						{/* Comment content */}
						<p
							className="text-sm"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
							dangerouslySetInnerHTML={{ __html: content || "" }}
						/>

						{/* Action buttons */}
						<div className="flex items-center">
							<Button variant="ghost" size="sm" className="gap-1 p-0">
								<ThumbsUp className="h-4 w-4" />
								<span>{likes}</span>
							</Button>

							<Button variant="ghost" size="sm" className="gap-1 p-0">
								<ThumbsDown className="h-4 w-4" />
								<span>{dislikes}</span>
							</Button>

							<Button
								variant="ghost"
								size="sm"
								className="gap-1 pb-0"
								onClick={() => setIsReplying(!isReplying)}
							>
								<Reply className="h-4 w-4" />
								Reply
							</Button>
						</div>

						{/* Reply form */}
						{isReplying && (
							<div className="mt-3 space-y-2">
								<CommentEditBox postId={postId} parentId={id} />
								<div className="flex gap-2">
									<Button size="sm" onClick={handleReplySubmit}>
										Post Reply
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setIsReplying(false)}
									>
										Cancel
									</Button>
								</div>
							</div>
						)}

						{/* Replies toggle - only show if there are replies */}
						{/* {replies.length > 0 && (
              <Button
                variant="link"
                size="sm"
                className="mt-2 pl-0 gap-1"
                onClick={toggleReplies}
              >
                {areRepliesExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide replies
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show replies ({replies.length})
                  </>
                )}
              </Button>
            )} */}
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
										className="thread flex justify-end items-start relative  w-10"
									>
										<div className="box-border relative border-gray-200 dark:border-gray-800  h-12 border-0  border-solid border-b cursor-pointer w-[calc(50%+0.5px)] border-l rounded-bl-lg" />

										{replies.length > 1 && indx !== replies.length - 1 && (
											<div className="w-[1px] h-full bg-gray-200 dark:bg-gray-800 absolute top-0  left-1/2 -translate-x-1/2" />
										)}
									</div>

									<CommentViewBox comment={reply} postId={postId} />
								</div>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			</CardContent>
		</Card>
	);
}
