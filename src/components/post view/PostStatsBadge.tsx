import { Card, CardContent } from "@/components/ui/card";
import { PostWithExtraDetails } from "@/utils/types";
import { FC } from "react";
import { BiTargetLock } from "react-icons/bi";
import { FiCheckCircle } from "react-icons/fi";
import { GiTwoCoins } from "react-icons/gi";
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

// Interfaces
interface PostStatsBadgeProps {
	post: PostWithExtraDetails;
}

interface CoinsBadgeProps {
	coins: number;
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
							name: post.author.name,
							image: post.author.image,
							companyName: post.author.companyName,
						}}
					/>
				)}
				{post.difficulty && <DifficultyBadge difficulty={post.difficulty} />}
				<CoinsBadge coins={post.coins || 0} />
				<CompletionBadge completionCount={post.completionCount || 0} />
				<ViewsBadge views={post?.views?.count || 0} />
			</CardContent>
		</Card>
	);
};

// Difficulty Badge Component

// Coins Badge Component with Tooltip
const CoinsBadge: FC<CoinsBadgeProps> = ({ coins }) => {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex items-center justify-center gap-1 cursor-pointer">
						<GiTwoCoins
							className="text-yellow-500"
							size={25}
							//   strokeWidth={1}
						/>
						<span className="font-medium text-sm capitalize flex gap-1">
							{coins}
							<span className="hidden sm:block">coins</span>
						</span>
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<span>Earn coins upon completion</span>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

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
