import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { FiCheckCircle } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "../shared/DifficultyBadge";
import { ViewsBadge } from "../shared/viewsBadge";
import { FeedPost } from "@/utils/types";
import { Difficulty } from "@prisma/client";
import { usePathname } from "next/navigation";
import { useFeedContext } from "./FeedContext";
import Image from "next/image";
import AuthorNudge from "../post view/AuthorNudge";
import { Badge } from "../ui/badge";

interface FeedCardProps {
	post: FeedPost;
}

export const FeedCard: React.FC<FeedCardProps> = ({ post }) => {
	const { completionStatuses } = useFeedContext();
	const pathname = usePathname();
	const getUrl = (post: FeedPost) => `${pathname}/${post.slug}-${post.id}`;
	return (
		<Link href={getUrl(post)} className="cursor-pointer block" prefetch={false}>
			<Card className="relative">
				<CardContent className="flex flex-col gap-4 h-92 justify-between ">
					<p className="font-semibold overflow-hidden text-ellipsis capitalize line-clamp-3">
						{post.title}
					</p>
					{/* {post.author?.userProfile && (
            <AuthorNudge author={post.author.userProfile} onlyAvatar />
          )} */}
					{post.topics?.length > 0 &&
						post.topics.map((topic, index) => (
							<Badge key={index} className="text-sm">
								{topic}
							</Badge>
						))}
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
					<div className="flex gap-4 md:gap-8">
						<DifficultyBadge difficulty={post.difficulty || Difficulty.EASY} />
						<ViewsBadge views={post?.views?.count || 0} />
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
		</Link>
	);
};
