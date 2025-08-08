import { Card, CardContent } from "@/components/ui/card";
import { PostWithExtraDetails } from "@/utils/types";
import { FC } from "react";
import { BiTargetLock } from "react-icons/bi";
import { FiCheckCircle } from "react-icons/fi";

import AuthorNudge from "./AuthorNudge";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatNumInK } from "@/utils/formatNumInK";
import { DifficultyBadge } from "../shared/DifficultyBadge";
import { ViewsBadge } from "../shared/viewsBadge";
import { BookmarkBadge } from "../shared/BookmarkBadge";

// Interfaces
interface PostStatsBadgeProps {
	post: PostWithExtraDetails;
}

interface CompletionBadgeProps {
	completionCount: number;
}

// Main Component
export const PostStatsBadge: FC<PostStatsBadgeProps> = ({ post }) => {
	return (
		<Card className="border-none shadow-none bg-transparent">
			<CardContent className="flex gap-1 sm:gap-4 flex-wrap px-0">
				{post.author.name && (
					<AuthorNudge
						author={{
							id: post.author.id,
							name: post.author.name,
							image: post.author.image,
							companyName: post.author.companyName,
							username: post.author.username,
							karmaPoints: post.author.karmaPoints,
							description: post.author.description,
							role: post.author.role,
							jobTitle: post.author.jobTitle,
							externalLinks: post.author.externalLinks,
						}}
					/>
				)}
				{post.difficulty && <DifficultyBadge difficulty={post.difficulty} />}
				<CompletionBadge completionCount={post.completionCount || 0} />
				<ViewsBadge views={post?.views?.count || 0} />
			</CardContent>
		</Card>
	);
};

// Difficulty Badge Component

// Completion Badge Component
const CompletionBadge: FC<CompletionBadgeProps> = ({ completionCount }) => {
	return (
		<div className="flex items-center justify-center gap-1">
			<FiCheckCircle className="text-green-500" size={18} strokeWidth={3} />
			<span className="font-medium text-sm capitalize flex gap-1">
				{formatNumInK(completionCount)}
				<span className="hidden sm:block">completed</span>
			</span>
		</div>
	);
};
