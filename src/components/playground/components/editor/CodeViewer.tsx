"use client";
import { ChallengeTemplate } from "@/utils/types";
import { Copy, RefreshCw } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
	atomDark,
	oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";
import { useWebContainerStore } from "../../store/webContainer";

interface CodeViewerProps {
	challengeTemplates: ChallengeTemplate[];
	className?: string;
}

const getCodeFromTemplate = (tpl: any) => {
	const files = tpl.files || {};
	const defaultFilePath = tpl.defaultFile;
	let code = "";
	let language = "javascript";
	const fileName = defaultFilePath;
	const parts = defaultFilePath.split("/");
	let fileObj: unknown = files;
	for (const part of parts) {
		if (!fileObj || typeof fileObj !== "object") break;
		const dir = (fileObj as any).directory;
		fileObj = dir?.[part] ?? (fileObj as Record<string, unknown>)[part];
	}
	if (
		fileObj &&
		typeof fileObj === "object" &&
		(fileObj as any).file?.contents
	) {
		code = (fileObj as any).file.contents;
		const ext = fileName.split(".").pop()?.toLowerCase();
		if (ext === "js" || ext === "jsx") language = "jsx";
		else if (ext === "ts" || ext === "tsx") language = "tsx";
		else if (ext === "vue") language = "markup";
		else if (ext === "json") language = "json";
		else if (ext === "css") language = "css";
		else if (ext === "html") language = "html";
		else language = ext || "javascript";
	}
	return { code, language, fileName };
};

const CodeViewer: React.FC<CodeViewerProps> = ({
	challengeTemplates,
	className,
}) => {
	const { resolvedTheme } = useTheme();
	const style = resolvedTheme === "dark" ? atomDark : oneLight;
	const [activeTab, setActiveTab] = useState(
		challengeTemplates[0]?.answerTemplate?.id || "",
	);
	const selectTemplate = useWebContainerStore((state) => state.selectTemplate);
	const [isReloading, setIsReloading] = useState<string | null>(null);

	const handleCopy = (code: string) => {
		navigator.clipboard.writeText(code);
		toast.success("Copied to clipboard");
	};

	const handleReload = async (tpl: ChallengeTemplate) => {
		setIsReloading(tpl.answerTemplate.id);
		try {
			await selectTemplate(tpl.answerTemplate);
			toast.success("Template loaded to editor");
		} catch (e) {
			toast.error("Failed to load template");
		} finally {
			setIsReloading(null);
		}
	};

	return (
		<div
			className={`rounded-lg border bg-muted/30 p-0 overflow-hidden max-h-[50vw] ${className || ""}`}
		>
			<div className="flex gap-2 mb-2 border-b bg-muted/40 pt-2">
				{challengeTemplates.map((tpl) => (
					<button
						key={tpl.answerTemplate.id}
						type="button"
						onClick={() => setActiveTab(tpl.answerTemplate.id)}
						className={`px-3 py-1 rounded-t font-mono text-xs border-b-2 ${activeTab === tpl.answerTemplate.id ? "border-primary bg-background" : "border-transparent"}`}
						disabled={activeTab === tpl.answerTemplate.id}
					>
						{tpl.answerTemplate.id}
					</button>
				))}
			</div>
			<div className="overflow-y-auto max-h-[calc(30vw-60px)]">
				{challengeTemplates.map((tpl) => {
					if (tpl.answerTemplate.id !== activeTab) return null;
					const { code, language, fileName } = getCodeFromTemplate(
						tpl.answerTemplate,
					);
					return (
						<div key={tpl.answerTemplate.id} className="relative">
							<div className="flex items-center justify-between px-4 py-2 bg-muted text-xs font-mono border-b border-border text-muted-foreground">
								<span>{fileName}</span>
								<span className="flex gap-2">
									<button
										type="button"
										onClick={() => handleCopy(code)}
										className="hover:text-primary"
										title="Copy code"
									>
										<Copy className="w-4 h-4" />
									</button>
									<button
										type="button"
										onClick={() => handleReload(tpl)}
										className="hover:text-primary"
										title="Load to Editor"
										disabled={isReloading === tpl.answerTemplate.id}
									>
										<RefreshCw
											className={`w-4 h-4 ${isReloading === tpl.answerTemplate.id ? "animate-spin" : ""}`}
										/>
									</button>
								</span>
							</div>
							<SyntaxHighlighter
								language={language}
								style={style}
								customStyle={{ margin: 0, borderRadius: 0, background: "none" }}
								showLineNumbers
								wrapLongLines
							>
								{code}
							</SyntaxHighlighter>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default CodeViewer;
