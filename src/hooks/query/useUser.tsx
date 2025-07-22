import { User } from "@/db/schema/zod-schemas";
import { useQuery } from "@tanstack/react-query";

export function useUser() {
	return useQuery<User, Error>({
		queryKey: ["user"],
		queryFn: async (): Promise<User> => {
			const response = await fetch("/api/user");
			if (!response.ok) {
				throw new Error("Failed to fetch user profile");
			}
			return response.json();
		},
	});
}
