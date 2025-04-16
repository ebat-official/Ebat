import React, { FC } from "react";
import { EditorProvider } from "../shared/Lexical Editor/providers/EditorContext";
import RightPanelLayout from "../shared/RightPanelLayout";
import { ContentType, PostWithExtraDetails } from "@/utils/types";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Post, UserProfile } from "@prisma/client";
import { LexicalViewer } from "./LexicalViewer";
import { PostStatsBadge } from "./PostStatsBadge";
import { Separator } from "@/components/ui/separator";
import PostDetailsAccordian from "./PostDetailsAccordian";
import Comment from "@/components/comment/Comment";
import CommentContainer from "@/components/comment/CommentContainer";

type PostViewProps = {
	post: PostWithExtraDetails;
	dataLoading?: boolean;
};

const PostView: FC<PostViewProps> = ({ post }) => {
	return (
		<EditorProvider>
			<RightPanelLayout className="mt-8 min-h-[75vh]">
				<RightPanelLayout.MainPanel className="flex flex-col gap-2">
					<Card className="relative items-center ">
						<CardContent className="flex flex-col h-full justify-center px-4 md:px-8 w-full max-w-3xl ">
							<h1 className="opacity-80 w-full overflow-hidden text-lg md:text-2xl  lg:text-3xl font-bold bg-transparent appearance-none resize-none focus:outline-none mb-4 leading-relaxed">
								{post.title}
							</h1>
							<PostStatsBadge post={post} />
							<Separator className=" mt-2" />
							<LexicalViewer
								key={post.id}
								postId={post.id}
								defaultContent={post.content as ContentType}
							/>
							<div className="mt-4">
								<PostDetailsAccordian post={post} />
							</div>
						</CardContent>
						<CardContent className="w-full px-4 md:px-8 max-w-4xl gap-8 flex flex-col ">
							<Separator className=" my-6 " />

							<CommentContainer />
						</CardContent>
					</Card>
				</RightPanelLayout.MainPanel>
				<RightPanelLayout.SidePanel>
					<div className="h-screen " />
				</RightPanelLayout.SidePanel>
			</RightPanelLayout>
		</EditorProvider>
	);
};

export default PostView;
