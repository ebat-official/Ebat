"use client";

import {
	getExecutionResult,
	useCodeEditorStore,
} from "@/store/useCodeEditorStore";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import ButtonBlue from "../shared/ButtonBlue";

function RunButton() {
	const { runCode, language, isRunning } = useCodeEditorStore();

	const handleRun = async () => {
		await runCode();
		const result = getExecutionResult();

		// if (user && result) {
		// 	await saveExecution({
		// 		language,
		// 		code: result.code,
		// 		output: result.output || undefined,
		// 		error: result.error || undefined,
		// 	});
		// }
	};

	return (
		<ButtonBlue
			className="bg-gradient-to-r
               from-blue-500 to-blue-600 opacity-90 hover:opacity-100 transition-opacity"
			loadingText="Executing..."
			onClick={handleRun}
			disabled={isRunning}
			loading={isRunning}
		>
			<span>Run Code</span>
		</ButtonBlue>
	);
}
export default RunButton;
