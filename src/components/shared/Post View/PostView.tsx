import React, { FC } from "react";
import { EditorProvider } from "../Lexical Editor/providers/EditorContext";
import RightPanelLayout from "../RightPanelLayout";
import { ContentType, PostWithExtraDetails } from "@/utils/types";
import { Card, CardContent } from "../../ui/card";
import { Post, UserProfile } from "@prisma/client";
import { LexicalViewer } from "./LexicalViewer";
import { PostStatsBadge } from "./PostStatsBadge";

type PostViewProps = {
	post: PostWithExtraDetails;
	dataLoading?: boolean;
	userProfile: UserProfile;
};

const PostView: FC<PostViewProps> = ({ post, userProfile }) => {
	return (
		<EditorProvider>
			<RightPanelLayout className="mt-8 min-h-[75vh]">
				<RightPanelLayout.MainPanel>
					<Card className="relative">
						<CardContent className="flex flex-col h-full justify-center px-4 md:px-8">
							<h1 className="opacity-80 w-full overflow-hidden text-lg md:text-xl lg:text-3xl font-bold bg-transparent appearance-none resize-none focus:outline-none mb-4 leading-relaxed">
								{post.title}
							</h1>
							<PostStatsBadge post={post} userProfile={userProfile} />
							<LexicalViewer
								key={post.id}
								postId={post.id}
								defaultContent={post.content as ContentType}
							/>
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
