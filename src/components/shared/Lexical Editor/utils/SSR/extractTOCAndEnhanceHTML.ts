import { parseHTML } from "linkedom";

function formatSlug(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/--+/g, "-");
}

export function extractTOCAndEnhanceHTML(html: string): {
	toc: { id: string; title: string; level: number }[];
	htmlWithAnchors: string;
} {
	try {
		const { document } = parseHTML(html);
		const toc: { id: string; title: string; level: number }[] = [];
		const usedIds = new Set<string>();

		const headings = document.querySelectorAll("h1, h2, h3");
		for (const el of headings) {
			const title = el.textContent || "";
			const level = Number.parseInt(el.tagName.charAt(1), 10);
			const id = formatSlug(title);

			// Ensure uniqueness
			let uniqueId = id;
			let counter = 1;
			while (usedIds.has(uniqueId)) {
				uniqueId = `${id}-${counter++}`;
			}
			usedIds.add(uniqueId);

			el.setAttribute("id", uniqueId);
			toc.push({ id: uniqueId, title, level });
		}

		return {
			toc,
			htmlWithAnchors: document.toString(),
		};
	} catch (error) {
		// Fallback if parsing fails
		console.warn("Failed to parse HTML for TOC extraction:", error);
		return {
			toc: [],
			htmlWithAnchors: html,
		};
	}
}
