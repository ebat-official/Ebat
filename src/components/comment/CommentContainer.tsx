"use client";
import React, { FC, useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import CommentEditBox from "./CommentEditBox";
import { useComments } from "@/hooks/query/useComments";
import { COMMENT_SORT_OPTIONS } from "@/utils/contants";
import { CommentList } from "./CommentList";
import { CommentSortOption, CommentWithVotes } from "@/utils/types";
import { CommentSortSelect } from "./CommentSortSelect";

type CommentContainerProps = {
	postId: string;
};

const CommentContainer: FC<CommentContainerProps> = ({ postId }) => {
	const [page, setPage] = useState(1);
	const [comments, setComments] = useState<CommentWithVotes[]>([]);
	const [commentSortOption, setCommentSortOption] = useState<CommentSortOption>(
		COMMENT_SORT_OPTIONS.TOP,
	);
	const COMMENTS_TAKE = 5;
	const { data, error, isLoading } = useComments(postId, {
		page,
		take: COMMENTS_TAKE,
		depth: 3,
		sort: commentSortOption,
		skip: (page - 1) * COMMENTS_TAKE,
	});
	const totalCommments = data?.pagination?.totalCount || 0;
	useEffect(() => {
		setComments(data?.comments || []);
	}, [data]);

	const commentAddHandler = (comment: CommentWithVotes) => {
		setComments((prev) => [comment, ...prev]);
	};

	return (
		<div className="flex flex-col gap-8">
			<CommentEditBox postId={postId} commentAddHandler={commentAddHandler} />
			<div className="flex justify-between items-center">
				<div className="flex items-center justify-center gap-2">
					<span className="text-md font-bold">Comments</span>
					<Badge className="bg-blue-400 rounded-4xl ">{totalCommments}</Badge>
				</div>
				<CommentSortSelect onChange={setCommentSortOption} />
			</div>
			<CommentList
				comments={{ ...data, comments }}
				postId={postId}
				isLoading={isLoading}
				setCurrentPage={setPage}
				currentPage={page}
			/>
		</div>
	);
};

export default CommentContainer;
