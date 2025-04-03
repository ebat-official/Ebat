import { PostValidator } from "@/lib/validators/post";
import { Difficulty, PostType } from "@prisma/client";
import { z } from "zod";

export const getCompletionDuration = (data: z.infer<typeof PostValidator>) => {
	if (data.completionDuration) {
		return data.completionDuration;
	}

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
					return null;
			}
		case PostType.SYSTEMDESIGN:
			switch (data.difficulty) {
				case Difficulty.EASY:
					return 10;
				case Difficulty.MEDIUM:
					return 20;
				case Difficulty.HARD:
					return 45;
				default:
					return null;
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
					return null;
			}
		case PostType.CHALLENGE:
			switch (data.difficulty) {
				case Difficulty.EASY:
					return 3;
				case Difficulty.MEDIUM:
					return 7;
				case Difficulty.HARD:
					return 15;
				default:
					return null;
			}
		default:
			return null;
	}
};
