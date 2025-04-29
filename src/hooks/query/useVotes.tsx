import { fetchVoteCounts } from "@/utils/api utils/vote";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

interface VoteCounts {
	upVotes: number;
	downVotes: number;
}

export function useVotes(
	postId: string | undefined,
): UseQueryResult<VoteCounts, Error> {
	return useQuery<VoteCounts, Error>({
		queryKey: ["votes", postId],
		queryFn: () => fetchVoteCounts(postId!),
		enabled: !!postId,
	});
}
