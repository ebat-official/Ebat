export function sanitizeSearchQuery(query: string): string {
	return query
		.toLowerCase()
		.trim()
		.replace(/[!@#$%^&*()[\]{}<>|\\/~`"'=+:;,?]/g, " ") // Remove special chars
		.replace(/\s+/g, " ") // Collapse multiple spaces
		.split(" ")
		.filter(Boolean) // Remove empty terms
		.join("&"); // Join with AND operator
}
