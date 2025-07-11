import { Difficulty, DifficultyType } from "@/db/schema/enums";

/**
 * Get Tailwind CSS classes for difficulty badge styling
 * @param difficulty - The difficulty level
 * @returns CSS classes string for background, text, and hover states
 */
export const getDifficultyColor = (difficulty: DifficultyType) => {
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

/**
 * Get icon color classes for difficulty levels
 * @param difficulty - The difficulty level
 * @returns CSS classes string for icon colors
 */
export const getDifficultyIconColor = (difficulty: DifficultyType) => {
	switch (difficulty) {
		case Difficulty.EASY:
			return "text-green-500";
		case Difficulty.MEDIUM:
			return "text-yellow-500";
		case Difficulty.HARD:
			return "text-red-500";
		default:
			return "text-gray-500";
	}
};
