import { z } from "zod";

export const AnswerValidator = z.object({
	content: z.any(),
});

// export type PostCreationRequest = z.infer<typeof AnswerValidator>
