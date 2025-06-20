"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
	Terminal as TerminalIcon,
	X,
	Minimize2,
	RotateCw,
	Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebContainerStore } from "../../store/webContainer";

interface TerminalProps {
	output: string[];
}

// Memoized line class determination
function getLineClass(line: string): string {
	if (line.includes("✅")) return "text-green-400";
	if (line.includes("❌") || line.includes("Error") || line.includes("Failed"))
		return "text-red-400";
	if (line.includes("🚀") || line.includes("🔥")) return "text-blue-400";
	if (line.includes("📦") || line.includes("📥")) return "text-yellow-400";
	return "text-foreground";
}

export function Terminal({ output }: TerminalProps) {
	const terminalRef = useRef<HTMLDivElement>(null);
	const {
		restartServer,
		selectedTemplate,
		serverProcess,
		clearTerminalOutput,
	} = useWebContainerStore();
	const [isRestarting, setIsRestarting] = useState(false);
	const [autoScroll, setAutoScroll] = useState(true);

	// Handle manual scroll
	const handleScroll = () => {
		if (!terminalRef.current) return;

		const { scrollTop, scrollHeight, clientHeight } = terminalRef.current;
		const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
		setAutoScroll(isAtBottom);
	};

	// Auto-scroll effect
	useEffect(() => {
		if (autoScroll && terminalRef.current) {
			terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
		}
	}, [output, autoScroll]);

	const handleReset = async () => {
		try {
			setIsRestarting(true);
			await restartServer();
		} catch (error) {
			console.error("Failed to restart server:", error);
		} finally {
			setIsRestarting(false);
		}
	};

	// Memoize terminal content
	const terminalContent = useMemo(() => {
		if (output.length === 0) {
			return (
				<div className="text-muted-foreground">
					<p>Terminal ready.</p>
				</div>
			);
		}

		return (
			<div className="space-y-1">
				{output.map((line, index) => (
					<div key={index} className={getLineClass(line)}>
						{line}
					</div>
				))}
			</div>
		);
	}, [output]);

	return (
		<div className="h-full bg-transparent flex flex-col min-h-0">
			<div className="flex items-center px-4 justify-end">
				<div className="flex gap-1 px-4">
					<Button
						size="sm"
						variant="ghost"
						className="h-6 w-6 p-0"
						onClick={() => clearTerminalOutput()}
						title="Clear Terminal"
					>
						<Trash2 className="w-3 h-3" />
					</Button>
					<Button
						size="sm"
						variant="ghost"
						className="h-6 w-6 p-0"
						onClick={handleReset}
						disabled={!selectedTemplate || !serverProcess || isRestarting}
						title={
							!selectedTemplate
								? "Select a template first"
								: !serverProcess
									? "No server running"
									: isRestarting
										? "Restarting..."
										: "Reset Server"
						}
					>
						<RotateCw
							className={`w-3 h-3 ${isRestarting ? "animate-spin" : ""}`}
						/>
					</Button>
				</div>
			</div>

						<div
				ref={terminalRef}
				onScroll={handleScroll}
				className="max-h-96 overflow-y-scroll p-4 py-8 font-mono text-sm rounded-xl border"
			>
				{terminalContent}
			</div>
		</div>
	);
}
