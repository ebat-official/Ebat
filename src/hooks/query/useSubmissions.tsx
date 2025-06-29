import { useQuery } from "@tanstack/react-query";
import { ChallengeSubmission } from "@prisma/client";

export const useSubmissions = (postId: string) => {
	return useQuery({
		queryKey: ["submissions", postId],
		queryFn: async (): Promise<ChallengeSubmission[]> => {
			const response = await fetch(`/api/submissions/${postId}`);
			if (!response.ok) {
				throw new Error("Failed to fetch submissions");
			}
			return response.json();
		},
		enabled: !!postId,
	});
};
