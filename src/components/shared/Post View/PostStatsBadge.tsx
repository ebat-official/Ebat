import { Card, CardContent } from "@/components/ui/card";
import { Post as PrismaPost, User, UserProfile } from "@prisma/client";
import { FC } from "react";
import { FiCheckCircle } from "react-icons/fi";
import AuthorNudge from "./AuthorNudge";
import { BiCoinStack, BiTargetLock } from "react-icons/bi";
import { PostWithExtraDetails } from "@/utils/types";

interface PostStatsBadgeProps {
	post: PostWithExtraDetails;
	userProfile: UserProfile;
}

export const PostStatsBadge: FC<PostStatsBadgeProps> = ({
	post,
	userProfile,
}) => {
	return (
		<Card className="border-none py-0">
			<CardContent className="flex gap-4">
				<AuthorNudge author={userProfile} />
				{post.difficulty && <DifficultyBadge difficulty={post.difficulty} />}
				<CoinsBadge coins={post.coins || 0} />
				<CompletionBadge completionCount={post.completionCount || 0} />
			</CardContent>
		</Card>
	);
};

// Difficulty Badge Component
interface DifficultyBadgeProps {
	difficulty: string;
}

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
				className={`font-bold text-sm ${
					colorMap[difficulty.toUpperCase()] || "text-gray-500"
				}`}
			>
				{difficulty}
			</span>
		</div>
	);
};

// Coins Badge Component
interface CoinsBadgeProps {
	coins: number;
}

const CoinsBadge: FC<CoinsBadgeProps> = ({ coins }) => {
	return (
		<div className="flex items-center justify-center gap-1">
			<BiCoinStack className="text-yellow-500" size={20} />
			<span className="font-bold text-sm capitalize">{coins} coin</span>
		</div>
	);
};

// Completion Badge Component
interface CompletionBadgeProps {
	completionCount: number;
}

const CompletionBadge: FC<CompletionBadgeProps> = ({ completionCount }) => {
	const formatCount = (num: number) => {
		return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString();
	};

	return (
		<div className="flex items-center justify-center gap-1">
			<FiCheckCircle className="text-green-500" size={18} strokeWidth={3} />
			<span className="font-bold text-sm capitalize">
				{formatCount(completionCount)} completed
			</span>
		</div>
	);
};
