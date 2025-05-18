import { FC } from "react";
import { BiTargetLock } from "react-icons/bi";

interface DifficultyBadgeProps {
	difficulty: string;
}

export const DifficultyBadge: FC<DifficultyBadgeProps> = ({ difficulty }) => {
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
