import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-transition-progress/next";
import { Difficulty, SubCategory } from "@/db/schema/enums";
import { cn } from "@/lib/utils";
import { FeedPost } from "@/utils/types";
import Image from "next/image";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useState, startTransition } from "react";
import { BsBookmarkHeart } from "react-icons/bs";
import { FaRegCommentDots } from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";
import { LuBookmarkPlus, LuShare2 } from "react-icons/lu";
import { useProgress } from "react-transition-progress";
import AuthorNudge from "../post view/AuthorNudge";
import { DifficultyBadge } from "../shared/DifficultyBadge";
import { truncateText } from "../shared/Lexical Editor/utils/truncateText";
import { ViewsBadge } from "../shared/viewsBadge";
import { Button } from "../ui/button";
import { useFeedContext } from "./FeedContext";
import { PostLikeDummyButton } from "./PostLikeButton";
import { BookmarkBadge } from "../shared/BookmarkBadge";

interface FeedCardProps {
	post: FeedPost;
}

export const FeedCard: React.FC<FeedCardProps> = ({ post }) => {
	const { completionStatuses } = useFeedContext();
	const pathname = usePathname();
	const router = useRouter();
	const startProgress = useProgress();
	const params = useParams();

	// Get subcategory from params, default to 'blogs' if not present
	const subCategory = params.subCategory || SubCategory.BLOGS;

	// If we have a subcategory in the URL, use the current path + post slug
	// If we don't have a subcategory, append the default subcategory + post slug
	const getUrl = (post: FeedPost) => {
		const postPath = `${post.slug}-${post.id}`;
		return params.subCategory
			? `${pathname}/${postPath}`
			: `${pathname}/${subCategory}/${postPath}`;
	};

	const handleCardClick = () => {
		startTransition(async () => {
			startProgress();
			// Navigate to the post
			router.push(getUrl(post));
		});
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			handleCardClick();
		}
	};

	return (
		<li
			key={post.id}
			onClick={handleCardClick}
			onKeyDown={handleKeyDown}
			className="cursor-pointer block overflow-hidden"
		>
			<Card className="relative pb-2">
				<CardContent className="flex flex-col gap-4 h-92 justify-between ">
					<p className="font-semibold overflow-hidden text-ellipsis capitalize line-clamp-3">
						{post.title}
					</p>
					{post.author?.name && (
						<AuthorNudge
							author={{
								id: post.author.id,
								name: post.author.name,
								image: post.author.image,
								companyName: post.author.companyName,
							}}
						/>
					)}
					<div className="flex">
						{post.topics && post.topics.length > 0 && (
							<>
								{post.topics.slice(0, 2).map((topic, index) => (
									<Badge
										key={index}
										className="text-sm mr-2 opacity-80"
										variant="outline"
									>
										#{truncateText(topic, 13)}
									</Badge>
								))}
								{post.topics.length > 2 && (
									<Badge className="text-sm rounded-full" variant="outline">
										+{post.topics.length - 2}
									</Badge>
								)}
							</>
						)}
					</div>

					{post.thumbnail && (
						<Image
							src={post.thumbnail}
							alt={post.title || ""}
							width={320}
							height={180}
							className="rounded-md object-cover max-h-40 w-full"
							sizes="(max-width: 400ppx) 100vw, 320px"
							priority={false}
							loading="lazy"
						/>
					)}
					<div className="flex justify-between items-center">
						{/* <DifficultyBadge difficulty={post.difficulty || Difficulty.EASY} /> */}
						<PostLikeDummyButton count={post.votes || 0} />
						<ViewsBadge views={post?.views?.count || 0} />
						<Button className="rounded-full" variant="ghost">
							<Link
								href={`${getUrl(post)}#comments`}
								className="flex items-center gap-2 rounded-full"
							>
								<FaRegCommentDots />
								<span>{post.comments || 0}</span>
							</Link>
						</Button>
						<BookmarkBadge postId={post.id} />
						<Button className="rounded-full" variant="ghost" size="icon">
							<LuShare2 size={18} />
						</Button>
					</div>

					<span className="absolute right-2 top-2">
						<FiCheckCircle
							className={cn("text-gray-500", {
								"text-green-500": completionStatuses[post.id],
							})}
							size={18}
							strokeWidth={2}
						/>
					</span>
				</CardContent>
			</Card>
		</li>
	);
};
