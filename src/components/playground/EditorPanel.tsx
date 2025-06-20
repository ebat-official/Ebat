"use client";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { use, useEffect, useState } from "react";
import {
	defineMonacoThemes,
	EditorThemeId,
	LANGUAGE_CONFIG,
} from "./constants";
import { Editor } from "@monaco-editor/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { RotateCcwIcon, ShareIcon, TypeIcon } from "lucide-react";
import useMounted from "@/hooks/useMounted";
import { Card, CardContent } from "@/components/ui/card";
import { useSidebar } from "@/context/SidebarContext";
import { set } from "date-fns";
import { useTheme } from "next-themes";
import LanguageSelector from "./LanguageSelector";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { type Post } from "@prisma/client";

type EditorPanelProps = {
	post: Post;
};

function EditorPanel() {
	const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
	const {
		language,
		theme,
		fontSize,
		editor,
		setFontSize,
		setEditor,
		setTheme,
	} = useCodeEditorStore();
	const { setMobileNav } = useSidebar();
	const { resolvedTheme } = useTheme();
	setMobileNav(true);

	useEffect(() => {
		setTheme(
			resolvedTheme === "dark"
				? EditorThemeId.GitHubDark
				: EditorThemeId.VSLight,
		);
	}, [resolvedTheme, setTheme]);

	useEffect(() => {
		return () => {
			setMobileNav(false);
		};
	}, [setMobileNav]);

	const mounted = useMounted();

	useEffect(() => {
		const savedCode = localStorage.getItem(`editor-code-${language}`);
		const newCode = savedCode || LANGUAGE_CONFIG[language].defaultCode;
		if (editor) editor.setValue(newCode);
	}, [language, editor]);

	useEffect(() => {
		const savedFontSize = localStorage.getItem("editor-font-size");
		if (savedFontSize) setFontSize(parseInt(savedFontSize));
	}, [setFontSize]);

	const handleRefresh = () => {
		const defaultCode = LANGUAGE_CONFIG[language].defaultCode;
		if (editor) editor.setValue(defaultCode);
		localStorage.removeItem(`editor-code-${language}`);
	};

	const handleEditorChange = (value: string | undefined) => {
		if (value) localStorage.setItem(`editor-code-${language}`, value);
	};

	const handleFontSizeChange = (newSize: number) => {
		const size = Math.min(Math.max(newSize, 12), 24);
		setFontSize(size);
		localStorage.setItem("editor-font-size", size.toString());
	};

	if (!mounted) return null;

	return (
		<Card className="h-full">
			<CardContent className="p-6 h-full flex flex-col gap-2 ">
				{/* Header */}
				<div className="flex items-center gap-3 justify-between">
					{/* Font Size Slider */}

					<div className="px-2 py-1 rounded-xl flex items-center gap-3 border ">
						<TypeIcon className="size-4 text-gray-400" />
						<div className="flex items-center gap-3">
							<input
								type="range"
								min="12"
								max="24"
								value={fontSize}
								onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
								className="w-20 h-1 bg-gray-500 rounded-lg cursor-pointer"
							/>
							<span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[2rem] text-center">
								{fontSize}
							</span>
						</div>
					</div>

					<div className="flex gap-3">
						<LanguageSelector hasAccess={true} />

						<Button
							variant="outline"
							size="icon"
							onClick={handleRefresh}
							aria-label="Reset to default code"
						>
							<RotateCcwIcon className="size-4 text-gray-400" />
						</Button>
					</div>
				</div>

				{/* Editor */}
				<div className="relative group rounded-xl overflow-hidden ring-1 ring-white/[0.05] h-full">
					<Editor
						height="100%"
						language={LANGUAGE_CONFIG[language].monacoLanguage}
						onChange={handleEditorChange}
						theme={theme}
						beforeMount={defineMonacoThemes}
						onMount={(editor) => setEditor(editor)}
						options={{
							minimap: { enabled: false },
							fontSize,
							automaticLayout: true,
							scrollBeyondLastLine: false,
							padding: { top: 16, bottom: 16 },
							renderWhitespace: "selection",
							fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
							fontLigatures: true,
							cursorBlinking: "smooth",
							smoothScrolling: true,
							contextmenu: true,
							renderLineHighlight: "all",
							lineHeight: 1.6,
							letterSpacing: 0.5,
							roundedSelection: true,
							scrollbar: {
								verticalScrollbarSize: 8,
								horizontalScrollbarSize: 8,
							},
						}}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
export default EditorPanel;
