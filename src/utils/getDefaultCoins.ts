import { PostValidator } from "@/lib/validators/post";
import { Difficulty, PostType } from "@prisma/client";
import { z } from "zod";

export const getDefaultCoins = (data: z.infer<typeof PostValidator>) => {
	switch (data.type) {
		case PostType.QUESTION:
			switch (data.difficulty) {
				case Difficulty.EASY:
					return 1;
				case Difficulty.MEDIUM:
					return 3;
				case Difficulty.HARD:
					return 5;
				default:
					return 0;
			}
		case PostType.SYSTEMDESIGN:
			switch (data.difficulty) {
				case Difficulty.EASY:
					return 5;
				case Difficulty.MEDIUM:
					return 10;
				case Difficulty.HARD:
					return 20;
				default:
					return 0;
			}
		case PostType.BLOGS:
			switch (data.difficulty) {
				case Difficulty.EASY:
					return 5;
				case Difficulty.MEDIUM:
					return 10;
				case Difficulty.HARD:
					return 20;
				default:
					return 0;
			}
		case PostType.CHALLENGE:
			switch (data.difficulty) {
				case Difficulty.EASY:
					return 3;
				case Difficulty.MEDIUM:
					return 5;
				case Difficulty.HARD:
					return 10;
				default:
					return 0;
			}
		default:
			return 0;
	}
};
