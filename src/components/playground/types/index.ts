import { editor } from "monaco-editor";
import { EditorThemeId } from "../constants";

export interface ExecutionResult {
	code: string;
	output: string;
	error: string | null;
}
export interface CodeEditorState {
	language: string;
	theme: string;
	fontSize: number;
	editor: editor.IStandaloneCodeEditor | null;
	output: string;
	isRunning: boolean;
	error: string | null;
	executionResult: {
		code: string;
		output: string;
		error: string | null;
	} | null;
	getCode: () => string;
	setEditor: (editor: editor.IStandaloneCodeEditor) => void;
	setTheme: (theme: string) => void;
	setFontSize: (fontSize: number) => void;
	setLanguage: (language: string) => void;
	runCode: () => Promise<void>;
}
