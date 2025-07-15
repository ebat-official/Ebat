import type { FileSystemTree } from "../../lib/types";
import { DIRECTORY, FILE } from "./constants";

export type FileKind = typeof FILE | typeof DIRECTORY;

export interface FileTreeProps {
	files: FileSystemTree;
	activeFile: string | null;
	onFileSelect: (filePath: string) => void;
	onFileCreate: (
		filePath: string,
		content?: string,
		isDirectory?: boolean,
	) => void;
	onFileDelete: (filePath: string) => void;
	onFileRename: (oldPath: string, newPath: string) => void;
	searchQuery: string;
	basePath: string;
	level: number;
}

export interface TreeElement {
	name: string;
	path: string;
	kind: FileKind;
	node: FileSystemTree[string];
	children?: TreeElement[];
	isPending?: boolean;
	pendingId?: string;
}

export interface FileTreeItemProps {
	element: TreeElement;
	level: number;
	activeFile: string | null;
	onFileSelect: (filePath: string) => void;
	onFileCreate: (
		filePath: string,
		content?: string,
		isDirectory?: boolean,
	) => void;
	onFileDelete: (filePath: string) => void;
	onFileRename: (oldPath: string, newPath: string) => void;
	searchQuery: string;
	isExpanded: boolean;
	onToggleExpanded: (path: string) => void;
	expandedFolders: Set<string>;
}

export interface PendingItem {
	id: string;
	kind: FileKind;
}
