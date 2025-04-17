import React, { FC } from "react";
import { Badge } from "../ui/badge";
import CommentEditBox from "./CommentEditBox";

type CommentContainerProps = {};

const CommentContainer: FC<CommentContainerProps> = ({}) => {
	return (
		<div className="flex flex-col gap-8">
			<CommentEditBox content="dsfsd" />
			<div className="flex items-center justify-center gap-2 self-start">
				<span className="text-md font-bold">Comments</span>
				<Badge className="bg-blue-400 rounded-4xl ">25</Badge>
			</div>
		</div>
	);
};

export default CommentContainer;
