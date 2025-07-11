import { FC } from "react";
import { BiTargetLock } from "react-icons/bi";
import { DifficultyType } from "@/db/schema/enums";
import { getDifficultyIconColor } from "@/utils/difficultyUtils";

interface DifficultyBadgeProps {
	difficulty: DifficultyType;
}

export const DifficultyBadge: FC<DifficultyBadgeProps> = ({ difficulty }) => {
	const iconColor = getDifficultyIconColor(difficulty);

	return (
		<div className="flex items-center justify-center gap-1">
			<BiTargetLock size={20} className={iconColor} />
			<span className={`font-medium text-sm capitalize ${iconColor}`}>
				{difficulty.toLowerCase()}
			</span>
		</div>
	);
};
