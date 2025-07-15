"use client";

import { Input } from "@/components/ui/input";
import type { FileSystemTree } from "@webcontainer/api";
import { Folder, Search } from "lucide-react";
import React, { useState } from "react";
import { useWebContainerStore } from "../../store/webContainer";
import { FileTree } from "./FileTree";

interface FileExplorerProps {
	files: FileSystemTree;
	onFileCreate: (
		filePath: string,
		content?: string,
		isDirectory?: boolean,
	) => Promise<void>;
	onFileDelete: (filePath: string) => Promise<void>;
	onFileRename: (oldPath: string, newPath: string) => Promise<void>;
}

export function FileExplorer({
	files,
	onFileCreate,
	onFileDelete,
	onFileRename,
}: FileExplorerProps) {
	const { activeFile, handleFileSelect } = useWebContainerStore();
	const [searchQuery, setSearchQuery] = useState("");

	// Wrap onFileCreate to open the file after creation
	const handleCreate = async (
		filePath: string,
		content?: string,
		isDirectory?: boolean,
	) => {
		await onFileCreate(filePath, content, isDirectory);
		if (!isDirectory) {
			await handleFileSelect(filePath);
		}
	};

	return (
		<div className="h-full bg-card flex flex-col">
			<div className="p-4 border-b border-border">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2">
						<Folder className="w-4 h-4 text-primary" />
						<span className="font-medium">Explorer</span>
					</div>
				</div>

				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input
						placeholder="Search files..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9 h-8"
					/>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto">
				<FileTree
					files={files}
					activeFile={activeFile}
					onFileSelect={handleFileSelect}
					onFileCreate={handleCreate}
					onFileDelete={onFileDelete}
					onFileRename={onFileRename}
					searchQuery={searchQuery}
					basePath=""
					level={0}
				/>
			</div>
		</div>
	);
}
