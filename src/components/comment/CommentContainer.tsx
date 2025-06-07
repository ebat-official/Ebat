"use client";
import React from "react";
import { Badge } from "../ui/badge";
import CommentAddBox from "./CommentAddBox";
import { CommentList } from "./CommentList";
import { CommentSortSelect } from "./CommentSortSelect";
import { CommentProvider, useCommentContext } from "./CommentContext";

type CommentContainerProps = {
	postId: string;
};

const CommentInner = () => {
	const { totalComments, setCommentSortOption, addComment, postId } =
		useCommentContext();

	return (
		<div className="flex flex-col gap-8" id="comments">
			<CommentAddBox postId={postId} commentAddHandler={addComment} />
			<div className="flex justify-between items-center">
				<div className="flex items-center justify-center gap-2">
					<span className="text-md font-bold">Comments</span>
					<Badge className="blue-gradient text-white rounded-4xl">
						{totalComments}
					</Badge>
				</div>
				<CommentSortSelect onChange={setCommentSortOption} />
			</div>
			<CommentList />
		</div>
	);
};

const CommentContainer: React.FC<CommentContainerProps> = ({ postId }) => {
	return (
		<CommentProvider postId={postId}>
			<CommentInner />
		</CommentProvider>
	);
};

export default CommentContainer;
