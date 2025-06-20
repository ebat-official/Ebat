import { useWebContainerStore } from "../../store/webContainer";
import { CodeEditor } from "../editor/CodeEditor";
import { FileTabs } from "./FileTabs";

export function EditorPanel() {
	const {
		openFiles,
		activeFile,
		handleFileContentChange,
		handleFileSelect,
		handleCloseFile,
	} = useWebContainerStore();

	const currentFile = openFiles.find((file) => file.path === activeFile);

	return (
		<div className="flex-1 flex flex-col border-r border-border">
			<FileTabs
				openFiles={openFiles}
				activeFile={activeFile}
				onFileSelect={handleFileSelect}
				onFileClose={handleCloseFile}
			/>
			<div className="flex-1">
				{currentFile ? (
					<CodeEditor
						filePath={activeFile!}
						content={currentFile.content}
						language={currentFile.language}
						onChange={handleFileContentChange}
					/>
				) : (
					<div className="h-full flex items-center justify-center text-muted-foreground">
						<div className="text-center">
							<p className="text-lg mb-2">No file selected</p>
							<p className="text-sm">
								Open a file from the explorer to start editing
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
