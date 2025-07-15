"use client";

import Editor, { useMonaco } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import React, { useEffect } from "react";
import { EditorThemeId, defineMonacoThemes } from "../../constants";

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
	const monaco = useMonaco();

	useEffect(() => {
		if (monaco) {
			// Enhanced TypeScript configuration for better WebContainer support
			monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
				jsx: monaco.languages.typescript.JsxEmit.React,
				esModuleInterop: true,
				target: monaco.languages.typescript.ScriptTarget.ESNext,
				allowNonTsExtensions: true,
				moduleResolution:
					monaco.languages.typescript.ModuleResolutionKind.NodeJs,
				allowSyntheticDefaultImports: true,
				strict: true,
				noImplicitAny: true,
				noImplicitReturns: true,
				noFallthroughCasesInSwitch: true,
				noUncheckedIndexedAccess: true,
				exactOptionalPropertyTypes: true,
				lib: ["dom", "dom.iterable", "esnext"],
				skipLibCheck: true,
				forceConsistentCasingInFileNames: true,
				resolveJsonModule: true,
				isolatedModules: true,
				noEmit: true,
			});

			// Enhanced JavaScript configuration
			monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
				target: monaco.languages.typescript.ScriptTarget.ESNext,
				allowNonTsExtensions: true,
				moduleResolution:
					monaco.languages.typescript.ModuleResolutionKind.NodeJs,
				allowSyntheticDefaultImports: true,
				esModuleInterop: true,
				lib: ["dom", "dom.iterable", "esnext"],
				skipLibCheck: true,
				forceConsistentCasingInFileNames: true,
				resolveJsonModule: true,
				isolatedModules: true,
				noEmit: true,
			});

			// Add React type definitions for better IntelliSense
			monaco.languages.typescript.typescriptDefaults.addExtraLib(
				`declare module "react" {
					export = React;
					export as namespace React;
				}`,
				"react.d.ts",
			);

			monaco.languages.typescript.typescriptDefaults.addExtraLib(
				`declare module "react-dom" {
					export = ReactDOM;
					export as namespace ReactDOM;
				}`,
				"react-dom.d.ts",
			);

			// Add Vue.js type definitions for better IntelliSense
			monaco.languages.typescript.typescriptDefaults.addExtraLib(
				`declare module "vue" {
					export function ref<T>(value: T): { value: T };
					export function reactive<T>(obj: T): T;
					export function computed<T>(fn: () => T): { readonly value: T };
					export function watch<T>(source: T, callback: (newValue: T, oldValue: T) => void): void;
					export function onMounted(fn: () => void): void;
					export function onUnmounted(fn: () => void): void;
					export function createApp(component: any): any;
					export function defineComponent(options: any): any;
					export function h(type: string, props?: any, children?: any): any;
				}`,
				"vue.d.ts",
			);

			// Add Vue.js template syntax support
			monaco.languages.typescript.typescriptDefaults.addExtraLib(
				`declare global {
					interface Window {
						Vue: any;
					}
				}`,
				"vue-global.d.ts",
			);

			// Configure Vue.js language features
			if (language?.toLowerCase() === "vue") {
				// Register Vue.js language features
				monaco.languages.register({ id: "vue" });
				monaco.languages.setMonarchTokensProvider("vue", {
					tokenizer: {
						root: [
							[/<template>/, "keyword"],
							[/<\/template>/, "keyword"],
							[/<script>/, "keyword"],
							[/<\/script>/, "keyword"],
							[/<style>/, "keyword"],
							[/<\/style>/, "keyword"],
							[/v-[a-zA-Z-]+/, "keyword"],
							[/@[a-zA-Z-]+/, "keyword"],
							[/{{.*?}}/, "string"],
						],
					},
				});
			}
		}
	}, [monaco, language]);

	const theme =
		resolvedTheme === "dark" ? EditorThemeId.GitHubDark : EditorThemeId.VSLight;

	return (
		<div className="h-full overflow-hidden">
			<Editor
				height="100%"
				path={filePath}
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
					quickSuggestions: {
						other: true,
						comments: true,
						strings: true,
					},
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
					// Better IntelliSense
					parameterHints: {
						enabled: true,
					},
					hover: {
						enabled: true,
					},
					formatOnPaste: true,
					formatOnType: true,
				}}
			/>
		</div>
	);
}
