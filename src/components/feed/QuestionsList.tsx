import React, { FC } from "react";
import { useFeedContext } from "./FeedContext";
import { Card, CardContent } from "@/components/ui/card";
import { DifficultyBadge } from "../shared/DifficultyBadge";
import { FiCheckCircle } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { ViewsBadge } from "../shared/viewsBadge";
import { FeedPost } from "@/utils/types";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FeedPagination } from "./FeedPagination";

const QuestionsList: FC = () => {
	const { posts, isLoading, completionStatuses, context, setPage } =
		useFeedContext();
	const pathname = usePathname();

	if (isLoading) return <div>Loading...</div>;
	console.log("FeedContext", context);
	const getUrl = (post: FeedPost) => `${pathname}/${post.slug}-${post.id}`;

	return (
		<div className="flex flex-col gap-4">
			{posts.map((post) => (
				<Link
					key={post.id}
					href={getUrl(post)}
					className="cursor-pointer block"
					prefetch={false}
					onClick={() => {
						// Only executes during SPA navigation
						console.log("Navigating to", getUrl(post));
					}}
				>
					<Card>
						<CardContent className="flex items-center gap-4 py-2 md:py-4 justify-between">
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
								<span className="flex-1 font-semibold">{post.title}</span>
							</div>
							<div className="flex gap-4 md:gap-8">
								<DifficultyBadge difficulty={post.difficulty || "EASY"} />
								<ViewsBadge views={post?.views?.count || 0} />
							</div>
						</CardContent>
					</Card>
				</Link>
			))}
			<FeedPagination />
		</div>
	);
};

export default QuestionsList;
