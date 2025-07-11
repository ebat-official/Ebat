import { Difficulty, PostType } from "@/db/schema/enums";
import { PostValidator } from "@/lib/validators/post";
import { z } from "zod";

export const getCompletionDuration = (
	data: z.infer<typeof PostValidator>,
): number => {
	const { type, difficulty } = data;
	switch (type) {
		case PostType.QUESTION:
			switch (difficulty) {
				case Difficulty.EASY:
					return 15;
				case Difficulty.MEDIUM:
					return 30;
				case Difficulty.HARD:
					return 45;
				default:
					return 15;
			}
		case PostType.CHALLENGE:
			switch (difficulty) {
				case Difficulty.EASY:
					return 30;
				case Difficulty.MEDIUM:
					return 60;
				case Difficulty.HARD:
					return 90;
				default:
					return 30;
			}
		case PostType.BLOGS:
			return 10;
		case PostType.SYSTEMDESIGN:
			return 60;
		default:
			return 15;
	}
};
