import React, { FC } from "react";
import { useFeedContext } from "./FeedContext";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Circle, Flame } from "lucide-react"; // Example icons
import { DifficultyBadge } from "../shared/DifficultyBadge";
import { FiCheckCircle } from "react-icons/fi";
import { cn } from "@/lib/utils";

const difficultyColor = {
	EASY: "text-green-600",
	MEDIUM: "text-yellow-600",
	HARD: "text-red-600",
};

const QuestionsList: FC = () => {
	const { posts, isLoading } = useFeedContext();
	console.log(posts, "posts");
	if (isLoading) return <div>Loading...</div>;

	return (
		<div className="flex flex-col gap-4">
			{posts.map((post) => (
				<Card key={post.id}>
					<CardContent className="flex items-center gap-4 py-2 md:py-4 justify-between">
						<div className="flex gap-2 items-center">
							{/* 1. Completion status icon (example: always incomplete) */}
							<span>
								<FiCheckCircle
									className={cn("text-gray-500", {
										"text-green-500": post.completionStatus?.length,
									})}
									size={18}
									strokeWidth={2}
								/>
							</span>
							{/* 2. Title */}
							<span className="flex-1 font-semibold">{post.title}</span>
						</div>

						<div className="flex gap-4 md:gap-8">
							{/* 3. Difficulty */}
							<DifficultyBadge difficulty={post.difficulty || "EASY"} />
							{/* 4. Vote count */}
							<span className="flex items-center gap-1">
								<Flame className="w-4 h-4 text-orange-500" />
								{post._count?.votes ?? 0}
							</span>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
};

export default QuestionsList;
