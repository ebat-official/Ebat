"use client";

import { useState } from "react";
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

type CommentViewBoxProps = {
	comment: CommentWithVotes;
};
export function CommentViewBox({ comment }: CommentViewBoxProps) {
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
	const [areRepliesExpanded, setAreRepliesExpanded] = useState(false);
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
		<Card className="mb-4">
			<CardContent className="p-4">
				<div className="flex items-start gap-3">
					<Avatar className="h-9 w-9">
						<AvatarImage
							src={author?.image || undefined}
							alt="avatar"
							referrerPolicy="no-referrer"
						/>
						<AvatarFallback>{author?.userName.charAt(0)}</AvatarFallback>
					</Avatar>

					<div className="flex-1">
						{/* Header with author and timestamp */}
						<div className="flex items-center gap-2">
							<h4 className="font-semibold">{author?.userName}</h4>
							<span className="text-sm text-muted-foreground">
								{formatDistanceToNow(new Date(createdAt))} ago
							</span>
						</div>

						{/* Comment content */}
						<p
							className="mt-1 text-sm"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
							dangerouslySetInnerHTML={{ __html: content || "" }}
						/>

						{/* Action buttons */}
						<div className="mt-2 flex items-center gap-4">
							<Button variant="ghost" size="sm" className="gap-1">
								<ThumbsUp className="h-4 w-4" />
								<span>{likes}</span>
							</Button>

							<Button variant="ghost" size="sm" className="gap-1">
								<ThumbsDown className="h-4 w-4" />
								<span>{dislikes}</span>
							</Button>

							<Button
								variant="ghost"
								size="sm"
								className="gap-1"
								onClick={() => setIsReplying(!isReplying)}
							>
								<Reply className="h-4 w-4" />
								Reply
							</Button>
						</div>

						{/* Reply form */}
						{isReplying && (
							<div className="mt-3 space-y-2">
								<Textarea
									value={replyContent}
									onChange={(e) => setReplyContent(e.target.value)}
									placeholder="Write your reply..."
									className="min-h-[80px]"
								/>
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
				{areRepliesExpanded && replies.length > 0 && (
					<div className="ml-10 mt-2 border-l-2 pl-4">
						{replies.map((reply) => (
							<CommentViewBox key={reply.id} comment={reply} />
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
