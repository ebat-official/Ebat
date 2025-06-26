import React, { FC, useState, useEffect } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FileCode2 } from "lucide-react";
import type { FileSystemTree } from "../../playground/lib/types";
import type { Template } from "../../playground/lib/types";
import { useWebContainerStore } from "../../playground/store/webContainer";

interface DefaultFileSelectorProps {
	files: FileSystemTree | null;
	selectedTemplate: Template | null;
	onDefaultFileChange: (defaultFile: string) => void;
}

const DefaultFileSelector: FC<DefaultFileSelectorProps> = ({
	files,
	selectedTemplate,
	onDefaultFileChange,
}) => {
	const [availableFiles, setAvailableFiles] = useState<string[]>([]);
	const [selectedDefaultFile, setSelectedDefaultFile] = useState<string>("");
	const { getFileTree } = useWebContainerStore();

	// Helper function to get all file paths from FileSystemTree
	const getAllFilesFromTree = (
		tree: FileSystemTree,
		basePath = "",
	): string[] => {
		const files: string[] = [];

		for (const [name, item] of Object.entries(tree)) {
			const currentPath = basePath ? `${basePath}/${name}` : name;

			if ("file" in item) {
				// It's a file
				files.push(currentPath);
			} else if ("directory" in item) {
				// It's a directory, recursively get files
				files.push(...getAllFilesFromTree(item.directory, currentPath));
			}
		}

		return files;
	};

	// Get all files from the src directory
	useEffect(() => {
		const loadSrcFiles = async () => {
			try {
				const srcTree = await getFileTree("src");
				if (srcTree && Object.keys(srcTree).length > 0) {
					const srcFiles = getAllFilesFromTree(srcTree, "src");
					setAvailableFiles(srcFiles);

					// Set initial default file from template or find a good default
					let defaultFile = "";

					if (
						selectedTemplate?.defaultFile &&
						srcFiles.includes(selectedTemplate.defaultFile)
					) {
						// Use the template's defaultFile if it exists and is valid
						defaultFile = selectedTemplate.defaultFile;
					} else if (srcFiles.length > 0) {
						// Find a good default file
						const preferredFiles = srcFiles.filter(
							(file) =>
								file.includes("App.") ||
								file.includes("main.") ||
								file.includes("index."),
						);
						defaultFile = preferredFiles[0] || srcFiles[0];
					}

					if (defaultFile) {
						setSelectedDefaultFile(defaultFile);
						onDefaultFileChange(defaultFile);
					}
				}
			} catch (error) {
				console.error("Failed to load src files:", error);
			}
		};

		loadSrcFiles();
	}, [getFileTree, selectedTemplate, onDefaultFileChange]);

	const handleFileSelect = (filePath: string) => {
		setSelectedDefaultFile(filePath);
		onDefaultFileChange(filePath);
	};

	if (!files || availableFiles.length === 0) {
		return null;
	}

	return (
		<Card className="mb-4">
			<CardContent className="p-4">
				<div className="flex items-center gap-2 mb-3">
					<FileCode2 className="w-4 h-4 text-primary" />
					<Label className="text-sm font-medium">Default File</Label>
				</div>
				<p className="text-xs text-muted-foreground mb-3">
					Choose which file from the src folder should open first when users
					load this template
				</p>
				<Select value={selectedDefaultFile} onValueChange={handleFileSelect}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select default file..." />
					</SelectTrigger>
					<SelectContent>
						{availableFiles.map((file) => (
							<SelectItem key={file} value={file}>
								{file}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</CardContent>
		</Card>
	);
};

export default DefaultFileSelector;
