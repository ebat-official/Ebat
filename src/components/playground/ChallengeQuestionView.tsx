import React from "react";
import { Card, CardContent } from "../ui/card";
import { PostStatsBadge } from "../post view/PostStatsBadge";
import { Separator } from "@/components/ui/separator";
import PostDetailsAccordian from "../post view/PostDetailsAccordian";
import CommentContainer from "@/components/comment/CommentContainer";
import { PostContentRender } from "../post view/PostContentRender";
import PostLikeButton from "../post view/PostLikeButton";
import { ContentReturnType, PostWithExtraDetails } from "@/utils/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Lightbulb, MessageCircle, Upload } from "lucide-react";

type ChallengeQuestionViewProps = {
	post: PostWithExtraDetails;
};

const ChallengeQuestionView: React.FC<ChallengeQuestionViewProps> = ({
	post,
}) => (
	<Tabs defaultValue="description" className="h-full">
		<Card className="h-full pt-0">
			<TabsList className="w-full  py-6">
				<TabsTrigger value="description">
					<FileText className="h-4 w-4" />
					Description
				</TabsTrigger>
				<TabsTrigger value="solution">
					<Lightbulb className="h-4 w-4" />
					Solution
				</TabsTrigger>
				<TabsTrigger value="discussion">
					<MessageCircle className="h-4 w-4" />
					Discussion
				</TabsTrigger>
				<TabsTrigger value="submissions">
					<Upload className="h-4 w-4" />
					Submissions
				</TabsTrigger>
			</TabsList>

			<div className="w-full h-full overflow-y-auto overflow-x-hidden">
				<TabsContent value="description" className="flex">
					<PostLikeButton postId={post.id} />
					<CardContent className="flex flex-col h-full justify-center px-4 md:px-8 w-full max-w-3xl gap-4">
						<h1 className="opacity-90 w-full overflow-hidden text-lg md:text-2xl  lg:text-3xl font-bold bg-transparent appearance-none resize-none focus:outline-none leading-relaxed">
							{post.title}
						</h1>
						<PostStatsBadge post={post} />
						<Separator />
						<PostContentRender content={post.content as ContentReturnType} />
					</CardContent>
				</TabsContent>

				<TabsContent value="solution">
					<PostContentRender content={post.content as ContentReturnType} />
				</TabsContent>

				<TabsContent value="discussion">
					<CommentContainer postId={post.id} />
				</TabsContent>

				<TabsContent value="submissions">
					<div className="flex items-center justify-center h-32 text-muted-foreground">
						<p>Submissions coming soon...</p>
					</div>
				</TabsContent>
			</div>
		</Card>
	</Tabs>
);

export default ChallengeQuestionView;
