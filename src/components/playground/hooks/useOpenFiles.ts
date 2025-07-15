import { useToast } from "@/hooks/use-toast";
import { WebContainer } from "@webcontainer/api";
import { useCallback, useState } from "react";

interface OpenFile {
	path: string;
	name: string;
	content: string;
	language: string;
	isDirty: boolean;
}

export function useOpenFiles(webContainer: WebContainer | null) {
	const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
	const [activeFile, setActiveFile] = useState<string | null>(null);
	const { toast } = useToast();

	const getLanguageFromPath = useCallback((filePath: string) => {
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
	}, []);

	const handleFileSelect = useCallback(
		async (filePath: string) => {
			if (!webContainer) return;

			// Check if file is already open
			const existingFile = openFiles.find((file) => file.path === filePath);
			if (existingFile) {
				setActiveFile(filePath);
				return;
			}

			try {
				const content = await webContainer.fs.readFile(filePath, "utf-8");
				const fileName = filePath.split("/").pop() || filePath;
				const language = getLanguageFromPath(filePath);

				const newFile: OpenFile = {
					path: filePath,
					name: fileName,
					content,
					language,
					isDirty: false,
				};

				setOpenFiles((prev) => [...prev, newFile]);
				setActiveFile(filePath);
			} catch (error) {
				console.error("Failed to read file:", error);
				toast({
					title: "Error",
					description: "Failed to read file",
					variant: "destructive",
				});
			}
		},
		[webContainer, openFiles, getLanguageFromPath, toast],
	);

	const handleFileContentChange = useCallback(
		async (content: string) => {
			if (!webContainer || !activeFile) return;

			// Update the file content in openFiles
			setOpenFiles((prev) =>
				prev.map((file) =>
					file.path === activeFile ? { ...file, content, isDirty: true } : file,
				),
			);

			try {
				await webContainer.fs.writeFile(activeFile, content);

				// Mark file as saved (not dirty)
				setOpenFiles((prev) =>
					prev.map((file) =>
						file.path === activeFile ? { ...file, isDirty: false } : file,
					),
				);
			} catch (error) {
				console.error("Failed to write file:", error);
				toast({
					title: "Error",
					description: "Failed to save file",
					variant: "destructive",
				});
			}
		},
		[webContainer, activeFile, toast],
	);

	const handleCloseFile = useCallback(
		(filePath: string) => {
			setOpenFiles((prev) => prev.filter((file) => file.path !== filePath));

			// If closing the active file, switch to another open file or null
			if (activeFile === filePath) {
				const remainingFiles = openFiles.filter(
					(file) => file.path !== filePath,
				);
				setActiveFile(
					remainingFiles.length > 0
						? remainingFiles[remainingFiles.length - 1].path
						: null,
				);
			}
		},
		[activeFile, openFiles],
	);

	const clearOpenFiles = useCallback(() => {
		setOpenFiles([]);
		setActiveFile(null);
	}, []);

	return {
		openFiles,
		activeFile,
		setActiveFile,
		handleFileSelect,
		handleFileContentChange,
		handleCloseFile,
		clearOpenFiles,
	};
}
