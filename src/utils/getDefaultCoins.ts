import { PostValidator } from "@/lib/validators/post";
import { Difficulty, PostType } from "@/db/schema/enums";
import { z } from "zod";

export const getDefaultCoins = (data: z.infer<typeof PostValidator>): number => {
	const { type, difficulty } = data;
	switch (type) {
		case PostType.QUESTION:
			switch (difficulty) {
				case Difficulty.EASY:
					return 10;
				case Difficulty.MEDIUM:
					return 15;
				case Difficulty.HARD:
					return 20;
				default:
					return 10;
			}
		case PostType.CHALLENGE:
			switch (difficulty) {
				case Difficulty.EASY:
					return 20;
				case Difficulty.MEDIUM:
					return 30;
				case Difficulty.HARD:
					return 40;
				default:
					return 20;
			}
		case PostType.BLOGS:
			return 5;
		case PostType.SYSTEMDESIGN:
			return 25;
		default:
			return 10;
	}
};
