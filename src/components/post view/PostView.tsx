import React, { FC } from "react";
import { EditorProvider } from "../shared/Lexical Editor/providers/EditorContext";
import RightPanelLayout from "../shared/RightPanelLayout";
import { ContentReturnType, PostWithExtraDetails } from "@/utils/types";
import { Card, CardContent } from "../ui/card";
import { PostStatsBadge } from "./PostStatsBadge";
import { Separator } from "@/components/ui/separator";
import PostDetailsAccordian from "./PostDetailsAccordian";
import CommentContainer from "@/components/comment/CommentContainer";
import { PostContentRender } from "./PostContentRender";
import PostLikeButton from "./PostLikeButton";

type PostViewProps = {
	post: PostWithExtraDetails;
	dataLoading?: boolean;
};

const PostView: FC<PostViewProps> = ({ post }) => {
	return (
		<EditorProvider>
			<RightPanelLayout className="mt-8 min-h-[75vh]">
				<RightPanelLayout.MainPanel className="flex flex-col gap-2">
					<Card className="relative items-center">
						<div className="flex w-full justify-center">
							<PostLikeButton postId={post.id} />
							<CardContent className="flex flex-col h-full justify-center px-4 md:px-8 w-full max-w-3xl gap-4">
								<h1 className="opacity-80 w-full overflow-hidden text-lg md:text-2xl  lg:text-3xl font-bold bg-transparent appearance-none resize-none focus:outline-none leading-relaxed">
									{post.title}
								</h1>
								<PostStatsBadge post={post} />
								<Separator />
								<PostContentRender
									content={post.content as ContentReturnType}
								/>
							</CardContent>
						</div>
						<CardContent className="w-full px-4 md:px-8 max-w-4xl gap-8 flex flex-col ">
							<Separator className=" my-6 " />
							<div className="md:hidden">
								<PostDetailsAccordian post={post} />
							</div>
							<CommentContainer postId={post.id} />
						</CardContent>
					</Card>
				</RightPanelLayout.MainPanel>
				<RightPanelLayout.SidePanel>
					<div className="hidden md:block">
						<PostDetailsAccordian post={post} />
					</div>
				</RightPanelLayout.SidePanel>
			</RightPanelLayout>
		</EditorProvider>
	);
};

export default PostView;
