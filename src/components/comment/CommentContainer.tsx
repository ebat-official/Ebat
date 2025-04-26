"use client";
import React, { FC, useState } from "react";
import { Badge } from "../ui/badge";
import CommentEditBox from "./CommentEditBox";
import { useComments } from "@/hooks/query/useComments";
import { COMMENT_SORT_OPTIONS } from "@/utils/contants";
import { CommentList } from "./CommentList";

type CommentContainerProps = {
	postId: string;
};

const CommentContainer: FC<CommentContainerProps> = ({ postId }) => {
	const [page, setPage] = useState(2);

	const { data, error, isLoading, isFetching } = useComments(postId, {
		page,
		take: 100,
		depth: 3,
		sort: COMMENT_SORT_OPTIONS.TOP,
	});
	return (
		<div className="flex flex-col gap-8">
			<CommentEditBox postId={postId} />
			<div className="flex items-center justify-center gap-2 self-start">
				<span className="text-md font-bold">Comments</span>
				<Badge className="bg-blue-400 rounded-4xl ">25</Badge>
			</div>
			{data?.comments && (
				<CommentList comments={data.comments} postId={postId} />
			)}
		</div>
	);
};

export default CommentContainer;
