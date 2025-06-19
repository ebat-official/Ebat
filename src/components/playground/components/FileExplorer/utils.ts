import { DIRECTORY, FILE, SRC_FOLDER } from "./constants";
import type { FileSystemTree } from "@/lib/types";
import type { TreeElement } from "./types";

export function convertAndSortTree(
	files: FileSystemTree,
	basePath: string = "",
	searchQuery: string = "",
): TreeElement[] {
	const elements: TreeElement[] = [];

	Object.entries(files).forEach(([name, node]) => {
		const path = basePath ? `${basePath}/${name}` : name;
		const isDirectory = DIRECTORY in node && node[DIRECTORY];
		const shouldShow =
			!searchQuery || name.toLowerCase().includes(searchQuery.toLowerCase());

		// Only show 'src' at the top level (basePath is empty)
		if (basePath === "" && name !== SRC_FOLDER) return;

		if (shouldShow) {
			const element: TreeElement = {
				name,
				path,
				kind: isDirectory ? DIRECTORY : FILE,
				node,
				children:
					isDirectory && node[DIRECTORY]
						? convertAndSortTree(
								node[DIRECTORY] as FileSystemTree,
								path,
								searchQuery,
							)
						: undefined,
			};
			elements.push(element);
		}
	});

	// Sort: directories first, then files, alphabetically within each group
	return elements.sort((a, b) => {
		if (a.kind === DIRECTORY && b.kind === FILE) return -1;
		if (a.kind === FILE && b.kind === DIRECTORY) return 1;
		return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
	});
}

export function getFileIcon(fileName: string) {
	const ext = fileName.split(".").pop()?.toLowerCase();
	switch (ext) {
		case "js":
		case "jsx":
			return { icon: "FileText", className: "text-yellow-400" };
		case "ts":
		case "tsx":
			return { icon: "FileText", className: "text-blue-400" };
		case "css":
			return { icon: "FileText", className: "text-pink-400" };
		case "html":
			return { icon: "FileText", className: "text-orange-400" };
		case "json":
			return { icon: "FileText", className: "text-green-400" };
		case "vue":
			return { icon: "FileText", className: "text-green-500" };
		case "md":
			return { icon: "FileText", className: "text-muted-foreground" };
		default:
			return { icon: "File", className: "text-muted-foreground" };
	}
}
