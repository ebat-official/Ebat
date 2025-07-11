import { PostValidator } from "@/lib/validators/post";
import { Difficulty, PostType } from "@/db/schema/enums";
import { z } from "zod";

export const getDefaultCoins = (
	data: z.infer<typeof PostValidator>,
): number => {
	const { type, difficulty } = data;
	switch (type) {
		case PostType.QUESTION:
			switch (difficulty) {
				case Difficulty.EASY:
					return 1;
				case Difficulty.MEDIUM:
					return 5;
				case Difficulty.HARD:
					return 10;
				default:
					return 10;
			}
		case PostType.CHALLENGE:
			switch (difficulty) {
				case Difficulty.EASY:
					return 5;
				case Difficulty.MEDIUM:
					return 10;
				case Difficulty.HARD:
					return 20;
				default:
					return 10;
			}
		case PostType.BLOGS:
			switch (difficulty) {
				case Difficulty.EASY:
					return 2;
				case Difficulty.MEDIUM:
					return 5;
				case Difficulty.HARD:
					return 10;
				default:
					return 5;
			}
		case PostType.SYSTEMDESIGN:
			switch (difficulty) {
				case Difficulty.EASY:
					return 5;
				case Difficulty.MEDIUM:
					return 10;
				case Difficulty.HARD:
					return 20;
				default:
					return 20;
			}
		default:
			return 10;
	}
};
