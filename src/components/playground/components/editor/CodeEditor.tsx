"use client";

import React from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { defineMonacoThemes, EditorThemeId } from "../../constants";

interface CodeEditorProps {
	filePath: string;
	content: string;
	language: string;
	onChange: (content: string) => void;
}

export function CodeEditor({
	filePath,
	content,
	language,
	onChange,
}: CodeEditorProps) {
	const handleEditorChange = (value: string | undefined) => {
		onChange(value || "");
	};

	const { resolvedTheme } = useTheme();
	const theme =
		resolvedTheme === "dark" ? EditorThemeId.GitHubDark : EditorThemeId.VSLight;
	console.log(theme, "theme");

	return (
		<div className="h-full overflow-hidden">
			<Editor
				height="100%"
				path={filePath}
				defaultLanguage={language}
				language={language}
				theme={theme}
				defaultValue={content}
				value={content}
				onChange={handleEditorChange}
				beforeMount={defineMonacoThemes}
				saveViewState={true}
				options={{
					minimap: { enabled: false },
					fontSize: 14,
					fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
					lineNumbers: "on",
					roundedSelection: true,
					scrollBeyondLastLine: false,
					automaticLayout: true,
					tabSize: 2,
					insertSpaces: true,
					wordWrap: "on",
					contextmenu: true,
					quickSuggestions: true,
					suggestOnTriggerCharacters: true,
					acceptSuggestionOnEnter: "on",
					bracketPairColorization: { enabled: true },
					guides: {
						bracketPairs: true,
						indentation: true,
					},
					padding: { top: 16, bottom: 16 },
					renderWhitespace: "selection",
					fontLigatures: true,
					cursorBlinking: "smooth",
					smoothScrolling: true,
					renderLineHighlight: "all",
					lineHeight: 1.6,
					letterSpacing: 0.5,
					scrollbar: {
						verticalScrollbarSize: 8,
						horizontalScrollbarSize: 8,
					},
				}}
			/>
		</div>
	);
}
