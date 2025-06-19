import React from "react";

interface OpenFile {
	path: string;
	name: string;
	content: string;
	language: string;
	isDirty: boolean;
}

interface FileTabsProps {
	openFiles: OpenFile[];
	activeFile: string | null;
	onFileSelect: (path: string) => void;
	onFileClose: (path: string) => void;
}

export function FileTabs({
	openFiles,
	activeFile,
	onFileSelect,
	onFileClose,
}: FileTabsProps) {
	if (openFiles.length === 0) return null;

	return (
		<div className="h-10 bg-muted/30 border-b border-border flex items-center overflow-x-auto">
			{openFiles.map((file) => (
				<div
					key={file.path}
					className={`flex items-center gap-2 px-3 py-2 border-r border-border cursor-pointer hover:bg-accent text-sm whitespace-nowrap ${
						activeFile === file.path ? "bg-background" : "bg-muted/50"
					}`}
					onClick={() => onFileSelect(file.path)}
				>
					<span className={file.isDirty ? "text-orange-500" : ""}>
						{file.name}
						{file.isDirty && " •"}
					</span>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onFileClose(file.path);
						}}
						className="hover:bg-accent rounded p-0.5 ml-1"
					>
						×
					</button>
				</div>
			))}
		</div>
	);
}
