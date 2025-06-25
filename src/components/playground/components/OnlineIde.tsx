"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Header } from "./layout/Headers";
import { FileExplorer } from "./FileExplorer/FileExplorer";
import { EditorPanel } from "./ide/EditorPanel";
import { useWebContainerStore } from "../store/webContainer";
import { useSidebar } from "@/context/SidebarContext";

export function OnlineIDE() {
	const [explorerCollapsed, setExplorerCollapsed] = useState(true);
	const {
		webContainer,
		selectedTemplate,
		initializeContainer,
		handleFileOperation,
		files,
		getFileTree,
		setFiles,
	} = useWebContainerStore();
	const { setMobileNav } = useSidebar();
	useEffect(() => {
		setMobileNav(true);
		return () => {
			setMobileNav(false);
		};
	}, [setMobileNav]);

	// Initialize WebContainer on mount
	useEffect(() => {
		initializeContainer();
	}, []);

	const handleFileCreate = useCallback(
		async (filePath: string, content = "", isDirectory = false) => {
			if (!webContainer) return;

			try {
				if (isDirectory) {
					await webContainer.fs.mkdir(filePath, { recursive: true });
					// Refresh file tree after directory creation
					const updatedFiles = await getFileTree(".");
					setFiles(updatedFiles);
				} else {
					await handleFileOperation("create", filePath, undefined, content);
				}
			} catch (error) {
				console.error(`Failed to create ${filePath}:`, error);
			}
		},
		[webContainer, getFileTree, setFiles, handleFileOperation],
	);

	const handleFileDelete = useCallback(
		async (filePath: string) => {
			if (!webContainer) return;

			try {
				await handleFileOperation("delete", filePath);
			} catch (error) {
				console.error(`Failed to delete ${filePath}:`, error);
			}
		},
		[webContainer, handleFileOperation],
	);

	const handleFileRename = useCallback(
		async (oldPath: string, newPath: string) => {
			if (!webContainer) return;
			try {
				await handleFileOperation("rename", oldPath, newPath);
			} catch (error) {
				console.error(`Failed to rename ${oldPath}:`, error);
			}
		},
		[webContainer, handleFileOperation],
	);

	return (
		<div className="bg-background text-foreground flex flex-col overflow-hidden h-full min-h-96">
			<Header
				explorerCollapsed={explorerCollapsed}
				onToggleExplorer={() => setExplorerCollapsed(!explorerCollapsed)}
			/>

			<div className="flex-1 flex overflow-hidden">
				{selectedTemplate && !explorerCollapsed && (
					<div className="w-64 border-r border-border flex-shrink-0">
						<FileExplorer
							files={files || {}}
							onFileCreate={handleFileCreate}
							onFileDelete={handleFileDelete}
							onFileRename={handleFileRename}
						/>
					</div>
				)}

				<EditorPanel />
			</div>
		</div>
	);
}
