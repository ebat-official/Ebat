export async function fetchVoteCountsFromAPI(postId: string) {
	if (!postId) {
		throw new Error("Post ID is required to fetch vote counts.");
	}
	const response = await fetch(`/api/post/votes/${postId}`);

	if (!response.ok) {
		let errorMessage = "Failed to fetch vote counts.";
		try {
			const errorData = await response.json();
			errorMessage = errorData.error || errorMessage;
		} catch {}
		throw new Error(errorMessage);
	}

	return response.json();
}
