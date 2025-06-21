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
			<TabsList className="w-full rounded-b-none  py-6">
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

			<div className="w-full h-full overflow-y-auto overflow-x-hidden px-4 md:px-8 max-w-4xl">
				<TabsContent value="description">
					<CardContent className="flex flex-col h-full justify-center gap-4 w-full">
						<div className="flex gap-6 -ml-12">
							<PostLikeButton postId={post.id} />
							<div>
								<h1 className="opacity-90 w-full overflow-hidden text-lg md:text-2xl  lg:text-3xl font-bold bg-transparent appearance-none resize-none focus:outline-none leading-relaxed">
									{post.title}
								</h1>
								<PostStatsBadge post={post} />
							</div>
						</div>
						<Separator />
						<PostContentRender content={post.content as ContentReturnType} />
						<Separator />
						<PostDetailsAccordian post={post} />
					</CardContent>
				</TabsContent>

				<TabsContent value="solution">
					<PostContentRender content={post.content as ContentReturnType} />
				</TabsContent>

				<TabsContent className="mt-8" value="discussion">
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
