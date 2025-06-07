import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { FiCheckCircle } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "../shared/DifficultyBadge";
import { ViewsBadge } from "../shared/viewsBadge";
import { FeedPost } from "@/utils/types";
import { Difficulty } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { useFeedContext } from "./FeedContext";
import Image from "next/image";
import AuthorNudge from "../post view/AuthorNudge";
import { Badge } from "../ui/badge";
import { truncateText } from "../shared/Lexical Editor/utils/truncateText";
import { PostLikeDummyButton } from "./PostLikeButton";
import { FaRegCommentDots } from "react-icons/fa";
import { Button } from "../ui/button";
import { BsBookmarkHeart } from "react-icons/bs";
import { LuBookmarkPlus, LuShare2 } from "react-icons/lu";

interface FeedCardProps {
	post: FeedPost;
}

export const FeedCard: React.FC<FeedCardProps> = ({ post }) => {
	const { completionStatuses } = useFeedContext();
	const pathname = usePathname();
	const router = useRouter();

	const getUrl = (post: FeedPost) => `${pathname}/${post.slug}-${post.id}`;

	const handleCardClick = () => {
		router.push(getUrl(post));
	};

	return (
		<li
			key={post.id}
			role="button"
			tabIndex={0}
			onClick={handleCardClick}
			className="cursor-pointer block overflow-hidden"
		>
			<Card className="relative pb-2">
				<CardContent className="flex flex-col gap-4 h-92 justify-between ">
					<p className="font-semibold overflow-hidden text-ellipsis capitalize line-clamp-3">
						{post.title}
					</p>
					{/* {post.author?.userProfile && (
            <AuthorNudge author={post.author.userProfile} />
          )} */}
					<div className="flex">
						{post.topics?.length > 0 && (
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
						<PostLikeDummyButton count={post._count?.votes || 0} />
						<ViewsBadge views={post?.views?.count || 0} />
						<Button className="rounded-full" variant="ghost">
							<Link
								href={getUrl(post) + "#comments"}
								className="flex items-center gap-2 rounded-full"
							>
								<FaRegCommentDots />
								<span>{post._count?.comments || 0}</span>
							</Link>
						</Button>
						<Button className="rounded-full" variant="ghost" size="icon">
							<LuBookmarkPlus />
						</Button>
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
