import React from "react";
import { Card, CardContent } from "../ui/card";
import { PostStatsBadge } from "../post view/PostStatsBadge";
import { Separator } from "@/components/ui/separator";
import PostDetailsAccordian from "../post view/PostDetailsAccordian";
import CommentContainer from "@/components/comment/CommentContainer";
import { PostContentRender } from "../post view/PostContentRender";
import PostLikeButton from "../post view/PostLikeButton";
import { ContentReturnType, PostWithExtraDetails } from "@/utils/types";

type ChallengeQuestionViewProps = {
	post: PostWithExtraDetails;
};

const ChallengeQuestionView: React.FC<ChallengeQuestionViewProps> = ({
	post,
}) => (
	<Card className="relative items-center overflow-y-auto">
		<div className="flex w-full justify-center ">
			<PostLikeButton postId={post.id} />
			<CardContent className="flex flex-col h-full justify-center px-4 md:px-8 w-full max-w-3xl gap-4">
				<h1 className="opacity-90 w-full overflow-hidden text-lg md:text-2xl  lg:text-3xl font-bold bg-transparent appearance-none resize-none focus:outline-none leading-relaxed">
					{post.title}
				</h1>
				<PostStatsBadge post={post} />
				<Separator />
				<div className="">
					<PostContentRender content={post.content as ContentReturnType} />
				</div>
			</CardContent>
		</div>
		<CardContent className="w-full px-4 md:px-8 max-w-4xl gap-8 flex flex-col ">
			<Separator className=" my-6 " />
			<PostDetailsAccordian post={post} />
			<CommentContainer postId={post.id} />
		</CardContent>
	</Card>
);

export default ChallengeQuestionView;
