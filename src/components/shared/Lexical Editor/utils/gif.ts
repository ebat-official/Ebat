const API_KEY = process.env.NEXT_PUBLIC_TENOR_API_KEY;

const fetchGifs = async ({ q = "trending" }: { q?: string }) => {
	const params = new URLSearchParams({
		key: API_KEY || "",
		q,
		limit: "200",
		media_filter: "minimal",
	});

	const response = await fetch(
		`https://tenor.googleapis.com/v2/search?${params.toString()}`,
	);

	if (!response.ok) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	}

	const data = await response.json();

	const gifs = data.results.map((gif: any) => ({
		id: gif.id,
		url: gif.media_formats.gif.url,
		alt_text: gif.content_description,
	}));

	return { gifs, next: data.next };
};

export default fetchGifs;
