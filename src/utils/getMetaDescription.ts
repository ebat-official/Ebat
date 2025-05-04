import * as cheerio from "cheerio";

export function getMetaDescription(html: string, minLength = 160): string {
	const $ = cheerio.load(html);

	let description = "";
	// Get the first span element's text
	const firstSpan = $("span").first();
	description = firstSpan.text().trim();

	// If the first span is too short, append text from the next span elements
	if (description.length < minLength) {
		$("span")
			.slice(1) // Start from the second span element
			.each((i, span) => {
				if (description.length >= minLength) return false; // Stop when we have enough content
				description += ` ${$(span).text().trim()}`;
			});
	}

	// Trim and return the description
	return description.length > 0 ? description.trim() : "";
}
