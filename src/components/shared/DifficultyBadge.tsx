import { FC } from "react";
import { BiTargetLock } from "react-icons/bi";
import { Difficulty, DifficultyType } from "@/db/schema/enums";

interface DifficultyBadgeProps {
	difficulty: DifficultyType;
}

// Utility function to get difficulty colors with background and hover styles
const getDifficultyColor = (difficulty: DifficultyType) => {
	switch (difficulty) {
		case Difficulty.EASY:
			return "bg-green-100 text-green-800 hover:bg-green-200";
		case Difficulty.MEDIUM:
			return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
		case Difficulty.HARD:
			return "bg-red-100 text-red-800 hover:bg-red-200";
		default:
			return "bg-gray-100 text-gray-800 hover:bg-gray-200";
	}
};

export const DifficultyBadge: FC<DifficultyBadgeProps> = ({ difficulty }) => {
	const colorMap: Record<DifficultyType, string> = {
		[Difficulty.EASY]: "text-green-500",
		[Difficulty.MEDIUM]: "text-yellow-500",
		[Difficulty.HARD]: "text-red-500",
	};

	return (
		<div className="flex items-center justify-center gap-1">
			<BiTargetLock
				size={20}
				className={colorMap[difficulty] || "text-gray-500"}
			/>
			<span
				className={`font-medium text-sm capitalize ${
					colorMap[difficulty] || "text-gray-500"
				}`}
			>
				{difficulty.toLowerCase()}
			</span>
		</div>
	);
};

// Export the utility function for use in other components
export { getDifficultyColor };
