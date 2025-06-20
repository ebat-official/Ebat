import { useState, useRef, useEffect } from "react";
import type { FileSystemTree } from "../../../lib/types";

export function useExpandedFolders(files: FileSystemTree, basePath: string) {
	const expandedRef = useRef<Set<string>>(new Set());
	const hasAutoExpanded = useRef(false);

	// State for reactivity - initialize from ref
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
		() => expandedRef.current,
	);

	// Auto-expand common folders on first load only
	useEffect(() => {
		if (!hasAutoExpanded.current && Object.keys(files).length > 0) {
			const autoExpandPaths = ["src"];
			const newExpanded = new Set<string>();
			for (const folderName of autoExpandPaths) {
				const folderPath = basePath ? `${basePath}/${folderName}` : folderName;
				if (files[folderName] && "directory" in files[folderName]) {
					newExpanded.add(folderPath);
				}
			}
			if (newExpanded.size > 0) {
				setExpandedFolders(newExpanded);
				hasAutoExpanded.current = true;
			}
		}
	}, [files, basePath]);

	const toggleExpanded = (path: string) => {
		setExpandedFolders((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(path)) {
				newSet.delete(path);
				expandedRef.current.delete(path);
			} else {
				newSet.add(path);
				expandedRef.current.add(path);
			}
			return newSet;
		});
	};

	return {
		expandedFolders,
		toggleExpanded,
	};
}
