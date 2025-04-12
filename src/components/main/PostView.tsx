"use client";
import React, { FC } from "react";
import { EditorProvider } from "../shared/Lexical Editor/providers/EditorContext";
import RightPanelLayout from "../shared/RightPanelLayout";
import EditorContainer from "../shared/Editor/EditorContainer";
import { LexicalEditorWrapper } from "../shared/Editor/Editor";
import { ContentType } from "@/utils/types";
import { Card, CardContent } from "../ui/card";
import { Post } from "@prisma/client";

type PostViewProps = {
	post: Post;
	dataLoading?: boolean;
};

const PostView: FC<PostViewProps> = ({ post }) => {
	return (
		<EditorProvider>
			<RightPanelLayout className="mt-8 min-h-[75vh]">
				<RightPanelLayout.MainPanel>
					<Card className="relative">
						<CardContent className="flex h-full justify-center px-4 md:px-8">
							<LexicalEditorWrapper
								key={post.id}
								postId={post.id}
								defaultContent={post.content as ContentType}
								isEditable={false}
								showCommandDetail={false}
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
