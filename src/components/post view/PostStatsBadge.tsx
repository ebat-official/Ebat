import { Card, CardContent } from "@/components/ui/card";
import { FC } from "react";
import { FiCheckCircle } from "react-icons/fi";
import AuthorNudge from "./AuthorNudge";
import { BiCoinStack, BiTargetLock } from "react-icons/bi";
import { PostWithExtraDetails } from "@/utils/types";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatNumInK } from "@/utils/formatNumInK";

// Interfaces
interface PostStatsBadgeProps {
	post: PostWithExtraDetails;
}

interface DifficultyBadgeProps {
	difficulty: string;
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
		<Card className="border-none py-0 shadow-none bg-transparent">
			<CardContent className="flex gap-1 sm:gap-4 px-0 sm:px-4 md:px-6">
				{post.author.userProfile && (
					<AuthorNudge author={post.author.userProfile} />
				)}
				{post.difficulty && <DifficultyBadge difficulty={post.difficulty} />}
				<CoinsBadge coins={post.coins || 0} />
				<CompletionBadge completionCount={post.completionCount || 0} />
			</CardContent>
		</Card>
	);
};

// Difficulty Badge Component
const DifficultyBadge: FC<DifficultyBadgeProps> = ({ difficulty }) => {
	const colorMap: Record<string, string> = {
		EASY: "text-green-500",
		MEDIUM: "text-yellow-500",
		HARD: "text-red-500",
	};

	return (
		<div className="flex items-center justify-center gap-1">
			<BiTargetLock
				size={20}
				className={colorMap[difficulty.toUpperCase()] || "text-gray-500"}
			/>
			<span
				className={`font-medium text-sm capitalize ${
					colorMap[difficulty.toUpperCase()] || "text-gray-500"
				}`}
			>
				{difficulty.toLowerCase()}
			</span>
		</div>
	);
};

// Coins Badge Component with Tooltip
const CoinsBadge: FC<CoinsBadgeProps> = ({ coins }) => {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex items-center justify-center gap-1 cursor-pointer">
						<BiCoinStack className="text-yellow-500" size={20} />
						<span className="font-medium text-sm capitalize flex gap-1">
							{coins}
							<span className="hidden sm:block">coin</span>
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
