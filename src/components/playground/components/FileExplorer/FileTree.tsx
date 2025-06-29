"use client";

import React, { useMemo, useState } from "react";
import { File, Folder, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PendingFileItem } from "./PendingFileItem";
import { FileTreeItemIcon } from "./FileTreeItemIcon";
import { FileTreeItemActions } from "./FileTreeItemActions";
import { cn } from "@/lib/utils";
import { convertAndSortTree } from "./utils";
import { useExpandedFolders } from "./hooks/useExpandedFolders";
import { usePendingItems } from "./hooks/usePendingItems";
import type { FileTreeProps, FileTreeItemProps, FileKind } from "./types";
import { DIRECTORY, FILE } from "./constants";

const FileTreeItem = React.memo(function FileTreeItem({
	element,
	level,
	activeFile,
	onFileSelect,
	onFileCreate,
	onFileDelete,
	onFileRename,
	searchQuery,
	isExpanded,
	onToggleExpanded,
	expandedFolders,
	renamingPath,
	setRenamingPath,
}: FileTreeItemProps & {
	renamingPath: string | null;
	setRenamingPath: (path: string | null) => void;
	onFileRename: (oldPath: string, newPath: string) => void;
}) {
	const { name, path, kind, children } = element;
	const isDirectory = kind === DIRECTORY;
	const isActive = activeFile === path;

	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const { pendingItems, createPendingItem, removePendingItem } =
		usePendingItems(onToggleExpanded, isExpanded);

	const handlePendingConfirm = (
		pendingId: string,
		itemName: string,
		itemKind: FileKind,
	) => {
		const fullPath = `${path}/${itemName}`;
		onFileCreate(fullPath, "", itemKind === DIRECTORY);
		removePendingItem(pendingId);
	};

	const handleClick = () => {
		if (isDirectory) {
			onToggleExpanded(path);
		} else {
			onFileSelect(path);
		}
	};

	const openDeleteDialog = () => {
		setIsDeleteDialogOpen(true);
	};

	const handleDelete = () => {
		onFileDelete(path);
		setIsDeleteDialogOpen(false);
	};

	const handleRename = () => {
		setRenamingPath(path);
		setDropdownOpen(false);
	};

	const handleRenameConfirm = (newName: string) => {
		if (newName && newName !== name) {
			const base = path.slice(0, path.lastIndexOf("/"));
			const newPath = base ? `${base}/${newName}` : newName;
			onFileRename(path, newPath);
		}
		setRenamingPath(null);
	};

	const handleRenameCancel = () => {
		setRenamingPath(null);
	};

	const handleRightClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDropdownOpen(true);
	};

	return (
		<div>
			{renamingPath === path ? (
				<PendingFileItem
					initialName={name}
					kind={kind}
					onConfirm={handleRenameConfirm}
					onCancel={handleRenameCancel}
					level={level}
				/>
			) : (
				<div
					className={cn(
						"flex items-center gap-2 px-3 py-1.5 hover:bg-accent cursor-pointer group relative",
						isActive && "bg-primary text-primary-foreground",
					)}
					style={{ paddingLeft: `${12 + level * 20}px` }}
					onClick={handleClick}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							handleClick();
						}
					}}
					onContextMenu={handleRightClick}
					role="button"
					tabIndex={0}
				>
					{isDirectory && (
						<Button
							variant="ghost"
							size="sm"
							className="p-0 h-auto w-auto hover:bg-transparent"
							onClick={(e) => {
								e.stopPropagation();
								onToggleExpanded(path);
							}}
						>
							{isExpanded ? (
								<ChevronDown className="w-4 h-4" />
							) : (
								<ChevronRight className="w-4 h-4" />
							)}
						</Button>
					)}

					{!isDirectory && <div className="w-4" />}

					<FileTreeItemIcon name={name} kind={kind} isExpanded={isExpanded} />

					<span className="flex-1 text-sm truncate min-w-0 pr-2">{name}</span>

					<FileTreeItemActions
						isDirectory={isDirectory}
						onCreateFile={() =>
							createPendingItem(FILE, isDirectory ? path : undefined)
						}
						onCreateFolder={() =>
							createPendingItem(DIRECTORY, isDirectory ? path : undefined)
						}
						onDelete={openDeleteDialog}
						onRename={handleRename}
						dropdownOpen={dropdownOpen}
						onDropdownOpenChange={setDropdownOpen}
					/>
				</div>
			)}

			{isDirectory && isExpanded && (
				<div className="space-y-0">
					{pendingItems.map((pendingItem) => (
						<PendingFileItem
							key={pendingItem.id}
							kind={pendingItem.kind}
							level={level + 1}
							onConfirm={(name) =>
								handlePendingConfirm(pendingItem.id, name, pendingItem.kind)
							}
							onCancel={() => removePendingItem(pendingItem.id)}
						/>
					))}

					{children?.map((child) => (
						<FileTreeItem
							key={child.path}
							element={child}
							level={level + 1}
							activeFile={activeFile}
							onFileSelect={onFileSelect}
							onFileCreate={onFileCreate}
							onFileDelete={onFileDelete}
							onFileRename={onFileRename}
							searchQuery={searchQuery}
							isExpanded={expandedFolders.has(child.path)}
							onToggleExpanded={onToggleExpanded}
							expandedFolders={expandedFolders}
							renamingPath={renamingPath}
							setRenamingPath={setRenamingPath}
						/>
					))}
				</div>
			)}

			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete "{name}
							"{isDirectory ? " and all its contents" : ""} from your project.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
});

export function FileTree({
	files,
	activeFile,
	onFileSelect,
	onFileCreate,
	onFileDelete,
	onFileRename,
	searchQuery,
	basePath,
	level,
}: FileTreeProps) {
	const { expandedFolders, toggleExpanded } = useExpandedFolders(
		files,
		basePath,
	);
	const { pendingItems, createPendingItem, removePendingItem } =
		usePendingItems();
	const [renamingPath, setRenamingPath] = useState<string | null>(null);

	const sortedElements = useMemo(() => {
		return convertAndSortTree(files, basePath, searchQuery);
	}, [files, basePath, searchQuery]);

	const handlePendingConfirm = (
		pendingId: string,
		itemName: string,
		itemKind: FileKind,
	) => {
		const fullPath = basePath ? `${basePath}/${itemName}` : itemName;
		onFileCreate(fullPath, "", itemKind === DIRECTORY);
		removePendingItem(pendingId);
	};

	// Only show file creation UI if we have files (template is selected)
	const showFileCreationUI = Object.keys(files).length > 0;

	return (
		<div className="w-full h-full bg-transparent">
			{showFileCreationUI && (
				<div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
					<span className="text-xs text-muted-foreground font-medium">
						EXPLORER
					</span>
					{/* <div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="sm"
							className="h-6 w-6 p-0 hover:bg-accent"
							onClick={() => createPendingItem(FILE)}
							title="New File"
						>
							<File className="w-3 h-3" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className="h-6 w-6 p-0 hover:bg-accent"
							onClick={() => createPendingItem(DIRECTORY)}
							title="New Folder"
						>
							<Folder className="w-3 h-3" />
						</Button>
					</div> */}
				</div>
			)}

			<div className="space-y-0">
				{pendingItems.map((pendingItem) => (
					<PendingFileItem
						key={pendingItem.id}
						kind={pendingItem.kind}
						level={level}
						onConfirm={(name) =>
							handlePendingConfirm(pendingItem.id, name, pendingItem.kind)
						}
						onCancel={() => removePendingItem(pendingItem.id)}
					/>
				))}

				{sortedElements.map((element) => (
					<FileTreeItem
						key={element.path}
						element={element}
						level={level}
						activeFile={activeFile}
						onFileSelect={onFileSelect}
						onFileCreate={onFileCreate}
						onFileDelete={onFileDelete}
						onFileRename={onFileRename}
						searchQuery={searchQuery}
						isExpanded={expandedFolders.has(element.path)}
						onToggleExpanded={toggleExpanded}
						expandedFolders={expandedFolders}
						renamingPath={renamingPath}
						setRenamingPath={setRenamingPath}
					/>
				))}
			</div>
		</div>
	);
}
