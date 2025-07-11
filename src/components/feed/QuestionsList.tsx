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
import { getDifficultyColor } from "@/utils/difficultyUtils";

interface QuestionsListProps {
	posts: PostSearchResponse["posts"];
	hasMore: boolean;
	onLoadMore: () => void;
	isLoading: boolean;
}

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
					{posts.map((post) => (
						<Link
							key={post.id}
							href={getUrl(post)}
							className="cursor-pointer block px-2 md:px-0"
							prefetch={false}
						>
							<Card>
								<CardContent className="flex items-center gap-4 min-h-16 md:min-h-16  justify-between">
									<div className="flex gap-2 items-center">
										<span>
											<FiCheckCircle
												className={cn("text-gray-500", {
													"text-green-500": completionStatuses[post.id],
												})}
												size={18}
												strokeWidth={2}
											/>
										</span>
										<p className=" font-semibold overflow-hidden text-ellipsis capitalize line-clamp-2">
											{post.title}
										</p>
									</div>
									<div className="flex gap-4 md:gap-8">
										<DifficultyBadge
											difficulty={post.difficulty || Difficulty.EASY}
										/>
										<ViewsBadge views={post?.views?.count || 0} />
									</div>
								</CardContent>
							</Card>
						</Link>
					))}
					<FeedPagination />
				</div>
			) : (
				<NoSearchResults category="Question" />
			)}
		</div>
	);
};

export default QuestionsList;
