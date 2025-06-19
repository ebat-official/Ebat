import { File, FileText, Folder, FolderOpen } from "lucide-react";
import { DIRECTORY, FILE } from "./constants";

interface FileTreeItemIconProps {
	name: string;
	kind: typeof FILE | typeof DIRECTORY;
	isExpanded: boolean;
}

export function FileTreeItemIcon({
	name,
	kind,
	isExpanded,
}: FileTreeItemIconProps) {
	if (kind === DIRECTORY) {
		return isExpanded ? (
			<FolderOpen className="w-4 h-4 text-primary" />
		) : (
			<Folder className="w-4 h-4 text-primary" />
		);
	}

	const ext = name.split(".").pop()?.toLowerCase();
	switch (ext) {
		case "js":
		case "jsx":
			return <FileText className="w-4 h-4 text-yellow-400" />;
		case "ts":
		case "tsx":
			return <FileText className="w-4 h-4 text-blue-400" />;
		case "css":
			return <FileText className="w-4 h-4 text-pink-400" />;
		case "html":
			return <FileText className="w-4 h-4 text-orange-400" />;
		case "json":
			return <FileText className="w-4 h-4 text-green-400" />;
		case "vue":
			return <FileText className="w-4 h-4 text-green-500" />;
		case "md":
			return <FileText className="w-4 h-4 text-muted-foreground" />;
		default:
			return <File className="w-4 h-4 text-muted-foreground" />;
	}
}
