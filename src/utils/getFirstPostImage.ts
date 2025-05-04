import * as cheerio from "cheerio";

export function getFirstImageUrl(html: string): string {
	const $ = cheerio.load(html);
	const img = $("img").first(); // Finds the first <img> tag
	const src = img.attr("src");
	return src || "";
}
