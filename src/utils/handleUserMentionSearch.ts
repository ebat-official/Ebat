import { fetchCommentUsersByUserName } from "./apiUtils";

import { debounce } from "lodash-es";

const debouncedFetch = debounce(fetchCommentUsersByUserName, 300);
export const handleUserMentionSearch = async (
	trigger: string,
	queryString?: string | null,
) => {
	const query = queryString || "";

	if (query.length < 2) return [];

	try {
		const data = await debouncedFetch(query);
		if (!data) return [];
		return data.map((user) => ({
			id: user.id,
			label: user.userName,
			value: user.userName,
		}));
	} catch (error) {
		console.error("Error fetching mentions:", error);
		return [];
	}
};
