import CommentContainer from "@/components/comment/CommentContainer";
import { Separator } from "@/components/ui/separator";
import { recordPostView } from "@/lib/viewTracker";
import { ContentReturnType, PostWithExtraDetails } from "@/utils/types";
import React, { FC } from "react";

import { EditorProvider } from "../shared/Lexical Editor/providers/EditorContext";
import RightPanelLayout from "../shared/RightPanelLayout";
import { Card, CardContent } from "../ui/card";
import { QuestionAnswerRender } from "./QuestionAnswerRender";
import PostDetailsAccordian from "./PostDetailsAccordian";
import PostLikeButton from "./PostLikeButton";
import { PostStatsBadge } from "./PostStatsBadge";
import { ContentRenderer } from "./ContentRenderer";
import FloatingActionBar from "./FloatingActionBar";

type PostViewProps = {
	post: PostWithExtraDetails;
	dataLoading?: boolean;
};

const PostView: FC<PostViewProps> = ({ post }) => {
	recordPostView(post.id);

	const content = post.content as ContentReturnType;
	return (
		<EditorProvider>
			<RightPanelLayout className="mt-8 min-h-[75vh]">
				<RightPanelLayout.MainPanel className="flex flex-col gap-2">
					<Card className="relative items-center">
						<CardContent className="flex flex-col h-full px-4 md:px-8 w-full gap-2 max-w-3xl relative">
							<div className="flex gap-6 -ml-12">
								<PostLikeButton className="mt-2" postId={post.id} />
								<div className="flex flex-col justify-center">
									<h1 className="opacity-90 w-full overflow-hidden text-lg md:text-2xl  lg:text-3xl font-bold bg-transparent appearance-none resize-none focus:outline-none leading-relaxed">
										{post.title}
									</h1>
									<PostStatsBadge post={post} />
								</div>
								<FloatingActionBar
									className="absolute left-0 top-0 translate-y-full lg:translate-x-full 2xl:-translate-x-[150%]"
									post={post}
								/>
							</div>
							<Separator />
							<ContentRenderer html={content.post} />
							<QuestionAnswerRender answer={content.answer} />
						</CardContent>
						<CardContent className="w-full px-4 md:px-8 max-w-4xl gap-8 flex flex-col ">
							<Separator className=" my-6 " />
							<div className="md:hidden">
								<PostDetailsAccordian post={post} />
							</div>
							<CommentContainer postId={post.id} />
						</CardContent>
					</Card>
				</RightPanelLayout.MainPanel>
				<RightPanelLayout.SidePanel className="sticky">
					<div className="hidden md:block">
						<PostDetailsAccordian post={post} />
					</div>
				</RightPanelLayout.SidePanel>
			</RightPanelLayout>
		</EditorProvider>
	);
};

export default PostView;
