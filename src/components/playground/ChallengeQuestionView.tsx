import CommentContainer from "@/components/comment/CommentContainer";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth-client";
import { ContentReturnType, PostWithExtraDetails } from "@/utils/types";
import { FileText, Lightbulb, MessageCircle, Upload } from "lucide-react";
import React from "react";
import { SubmissionsTable } from "../post edit/challenge/SubmissionsTable";
import { PostContentRender } from "../post view/PostContentRender";
import PostDetailsAccordian from "../post view/PostDetailsAccordian";
import PostLikeButton from "../post view/PostLikeButton";
import { PostStatsBadge } from "../post view/PostStatsBadge";
import { Card, CardContent } from "../ui/card";
import CodeViewer from "./components/editor/CodeViewer";

type ChallengeQuestionViewProps = {
	post: PostWithExtraDetails;
};

const ChallengeQuestionView: React.FC<ChallengeQuestionViewProps> = ({
	post,
}) => {
	const { data: session } = useSession();

	const content = post.content as ContentReturnType;
	const challengeTemplates = post.challengeTemplates || [];
	return (
		<Tabs defaultValue="description" className="h-full">
			<Card className="h-full pt-0">
				<TabsList className="w-full rounded-b-none">
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
							<PostContentRender post={content.post} />
							<Separator />
							<PostDetailsAccordian post={post} />
						</CardContent>
					</TabsContent>

					<TabsContent value="solution" className="flex flex-col gap-8">
						<PostContentRender answer={content.answer} />
						{challengeTemplates.length > 0 && (
							<CodeViewer challengeTemplates={challengeTemplates} />
						)}
					</TabsContent>

					<TabsContent className="mt-8" value="discussion">
						<CommentContainer postId={post.id} />
					</TabsContent>

					<TabsContent value="submissions">
						<SubmissionsTable
							postId={post.id}
							currentUserId={session?.user?.id}
						/>
					</TabsContent>
				</div>
			</Card>
		</Tabs>
	);
};

export default ChallengeQuestionView;
