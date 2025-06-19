import { useState, useCallback } from "react";
import { WebContainer } from "@webcontainer/api";
import type { FileSystemTree } from "@/lib/types";

export function useFileTree(webContainer: WebContainer | null) {
	const [files, setFiles] = useState<FileSystemTree>({});

	const getFileTree = useCallback(
		async (path: string): Promise<FileSystemTree> => {
			if (!webContainer) return {};

			const tree: FileSystemTree = {};
			try {
				const entries = await webContainer.fs.readdir(path, {
					withFileTypes: true,
				});

				for (const entry of entries) {
					const fullPath = path === "." ? entry.name : `${path}/${entry.name}`;

					if (entry.isDirectory()) {
						tree[entry.name] = {
							directory: await getFileTree(fullPath),
						};
					} else {
						const content = await webContainer.fs.readFile(fullPath, "utf-8");
						tree[entry.name] = {
							file: {
								contents: content,
							},
						};
					}
				}
			} catch (error) {
				console.error("Failed to read directory:", error);
			}

			return tree;
		},
		[webContainer],
	);

	const refreshFileTree = useCallback(async () => {
		if (!webContainer) return;
		const updatedFiles = await getFileTree(".");
		setFiles(updatedFiles);
	}, [webContainer, getFileTree]);

	return {
		files,
		setFiles,
		refreshFileTree,
		getFileTree,
	};
}
