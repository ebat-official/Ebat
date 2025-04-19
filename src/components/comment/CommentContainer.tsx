"use client";
import React, { FC, useState } from "react";
import { Badge } from "../ui/badge";
import CommentEditBox from "./CommentEditBox";
import { useComments } from "@/hooks/query/useComments";
import { COMMENT_SORT_OPTIONS } from "@/utils/contants";

type CommentContainerProps = {
	postId: string;
};

const CommentContainer: FC<CommentContainerProps> = ({ postId }) => {
	const [page, setPage] = useState(1);

	const { data, error, isLoading, isFetching } = useComments(postId, {
		page,
		take: 10,
		depth: 2,
		sort: COMMENT_SORT_OPTIONS.TOP,
	});
	console.log(data, isLoading, "pranav");
	return (
		<div className="flex flex-col gap-8">
			<CommentEditBox postId={postId} />
			<div className="flex items-center justify-center gap-2 self-start">
				<span className="text-md font-bold">Comments</span>
				<Badge className="bg-blue-400 rounded-4xl ">25</Badge>
			</div>
		</div>
	);
};

export default CommentContainer;
