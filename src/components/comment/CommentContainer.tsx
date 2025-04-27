"use client";
import React, { FC, useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import CommentEditBox from "./CommentEditBox";
import { useComments } from "@/hooks/query/useComments";
import { COMMENT_SORT_OPTIONS } from "@/utils/contants";
import { CommentList } from "./CommentList";
import { CommentWithVotes } from "@/utils/types";

type CommentContainerProps = {
	postId: string;
};

const CommentContainer: FC<CommentContainerProps> = ({ postId }) => {
	const [page, setPage] = useState(2);
	const [comments, setComments] = useState<CommentWithVotes[]>([]);
	const { data, error, isLoading } = useComments(postId, {
		page,
		take: 10,
		depth: 3,
		sort: COMMENT_SORT_OPTIONS.TOP,
	});

	useEffect(() => {
		setComments(data?.comments || []);
	}, [data]);

	const commentAddHandler = (comment: CommentWithVotes) => {
		setComments((prev) => [comment, ...prev]);
	};

	return (
		<div className="flex flex-col gap-8">
			<CommentEditBox postId={postId} commentAddHandler={commentAddHandler} />
			<div className="flex items-center justify-center gap-2 self-start">
				<span className="text-md font-bold">Comments</span>
				<Badge className="bg-blue-400 rounded-4xl ">25</Badge>
			</div>
			<CommentList comments={data} postId={postId} isLoading={isLoading} />
		</div>
	);
};

export default CommentContainer;
