import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { KarmaHistoryResponse } from "@/types/karma";

interface UseUserKarmaParams {
	limit?: number;
	offset?: number;
}

export function useUserKarma(
	params?: UseUserKarmaParams,
): UseQueryResult<KarmaHistoryResponse, Error> {
	const { limit = 20, offset = 0 } = params || {};

	return useQuery<KarmaHistoryResponse, Error>({
		queryKey: ["user-karma", limit, offset],
		queryFn: async (): Promise<KarmaHistoryResponse> => {
			const url = new URL("/api/karma", window.location.origin);
			url.searchParams.set("limit", limit.toString());
			url.searchParams.set("offset", offset.toString());

			const response = await fetch(url.toString());
			if (!response.ok) {
				throw new Error("Failed to fetch user karma");
			}

			return response.json();
		},
	});
}
