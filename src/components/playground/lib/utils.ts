import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Returns the Monaco/CodeMirror language for a given file path.
 * Used for syntax highlighting in the editor.
 */
export function getLanguageFromPath(filePath: string): string {
	const ext = filePath.split(".").pop()?.toLowerCase();
	switch (ext) {
		case "js":
		case "jsx":
			return "javascript";
		case "ts":
		case "tsx":
			return "typescript";
		case "css":
			return "css";
		case "html":
			return "html";
		case "json":
			return "json";
		case "md":
			return "markdown";
		case "vue":
			return "vue";
		case "py":
			return "python";
		case "yaml":
		case "yml":
			return "yaml";
		default:
			return "plaintext";
	}
}
