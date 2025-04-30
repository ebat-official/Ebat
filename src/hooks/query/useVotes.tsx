import { fetchVoteCountsFromAPI } from "@/utils/api utils/vote";
import { VoteType } from "@prisma/client";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

interface VoteCounts {
	upVotes: number;
	downVotes: number;
	userVoteType: VoteType | null;
}

export function useVotes(
	postId: string | undefined,
): UseQueryResult<VoteCounts, Error> {
	return useQuery<VoteCounts, Error>({
		queryKey: ["votes", postId],
		queryFn: () => fetchVoteCountsFromAPI(postId!),
		enabled: !!postId,
	});
}
