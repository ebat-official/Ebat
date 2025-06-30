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
		files,
		isInitializing,
		isContainerReady,
		isTemplateReady,
	} = useWebContainerStore();

	const currentFile = openFiles.find((file) => file.path === activeFile);

	// Check if we're still preparing the file system
	const isPreparingFileSystem = isInitializing || !isContainerReady || !files;

	return (
		<div className="flex-1 flex flex-col border-r border-border">
			<FileTabs
				openFiles={openFiles}
				activeFile={activeFile}
				onFileSelect={handleFileSelect}
				onFileClose={handleCloseFile}
			/>
			<div className="flex-1">
				{isPreparingFileSystem ? (
					<div className="h-full flex items-center justify-center text-muted-foreground">
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
							<p className="text-lg mb-2">Preparing file system...</p>
							<p className="text-sm">Setting up your coding environment</p>
						</div>
					</div>
				) : currentFile ? (
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
