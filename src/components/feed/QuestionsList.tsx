import React, { FC } from "react";
import { useFeedContext } from "./FeedContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DifficultyBadge } from "../shared/DifficultyBadge";
import { FiCheckCircle } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { ViewsBadge } from "../shared/viewsBadge";
import { FeedPost } from "@/utils/types";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FeedPagination } from "./FeedPagination";
import { QuestionSkeleton } from "./QuestionSkelton";
import { Difficulty } from "@/db/schema/enums";
import NoSearchResults from "./NoSearchResults";
import FeedSearch from "./FeedSearch";
import AddPostRoundButton from "./AddPostRoundButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, MessageCircle, ThumbsUp, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { DifficultyType } from "@/db/schema/enums";
import { PostSearchResponse } from "@/utils/types";
import { generatePostPath } from "@/utils/generatePostPath";

interface QuestionsListProps {
	posts: PostSearchResponse["posts"];
	hasMore: boolean;
	onLoadMore: () => void;
	isLoading: boolean;
}

const getDifficultyColor = (difficulty: DifficultyType) => {
	switch (difficulty) {
		case "EASY":
			return "bg-green-100 text-green-800 hover:bg-green-200";
		case "MEDIUM":
			return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
		case "HARD":
			return "bg-red-100 text-red-800 hover:bg-red-200";
		default:
			return "bg-gray-100 text-gray-800 hover:bg-gray-200";
	}
};

const QuestionsList: FC = () => {
	const { posts, isLoadingData, completionStatuses, context, pageSize } =
		useFeedContext();
	const pathname = usePathname();

	const getUrl = (post: FeedPost) => `${pathname}/${post.slug}-${post.id}`;

	return (
		<div className="flex flex-col gap-4">
			<div className="flex gap-2 justify-between items-center mx-4">
				<FeedSearch />
				<AddPostRoundButton />
			</div>
			{isLoadingData ? (
				<div className="flex flex-col gap-4">
					{Array.from({ length: pageSize }).map((_, i) => (
						<QuestionSkeleton key={i} />
					))}
				</div>
			) : posts.length > 0 ? (
				<div className="flex flex-col gap-4 mb-4">
					{posts.map((post) => {
						const postPath = generatePostPath({
							category: post.category,
							subCategory: post.subCategory,
							slug: post.slug || "",
							id: post.id,
							postType: post.type,
						});

						return (
							<Card key={post.id} className="hover:shadow-md transition-shadow">
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<CardTitle className="text-lg hover:text-primary">
												<Link href={postPath}>{post.title}</Link>
											</CardTitle>
											<div className="flex items-center gap-2 mt-2">
												<Badge
													variant="secondary"
													className={cn(
														"text-xs",
														getDifficultyColor(
															post.difficulty || Difficulty.EASY,
														),
													)}
												>
													{post.difficulty || Difficulty.EASY}
												</Badge>
												<Badge variant="outline" className="text-xs">
													{post.type}
												</Badge>
											</div>
										</div>
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="flex items-center justify-between text-sm text-muted-foreground">
										<div className="flex items-center gap-4">
											<div className="flex items-center gap-1">
												<User className="h-4 w-4" />
												<span>{post.author.userName}</span>
											</div>
											<div className="flex items-center gap-1">
												<Clock className="h-4 w-4" />
												<span>
													{formatDistanceToNow(new Date(post.createdAt), {
														addSuffix: true,
													})}
												</span>
											</div>
										</div>
										<div className="flex items-center gap-3">
											<div className="flex items-center gap-1">
												<Eye className="h-4 w-4" />
												<span>
													{typeof post.views === "object"
														? post.views.count
														: post.views || 0}
												</span>
											</div>
											<div className="flex items-center gap-1">
												<ThumbsUp className="h-4 w-4" />
												<span>{post._count?.votes || 0}</span>
											</div>
											<div className="flex items-center gap-1">
												<MessageCircle className="h-4 w-4" />
												<span>{post._count?.comments || 0}</span>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}
					<FeedPagination />
				</div>
			) : (
				<NoSearchResults category="Question" />
			)}
		</div>
	);
};

export default QuestionsList;
