import React, { useState } from "react";
import { useWebContainerStore } from "../../store/webContainer";
import { Terminal } from "../terminal/terminal";
import { TestPanel } from "../test/TestPanel";
import { FlaskConical, TerminalIcon, Play, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TestResult, VitestJsonResult } from "../../types/test";
import RunButton from "../../RunButton";
import { useAuthAction } from "@/hooks/useAuthAction";
import { isJSON } from "@/utils/isJSON";

export function BottomPanel() {
	const { terminalOutput, webContainer, addTerminalOutput, isTemplateReady } =
		useWebContainerStore();

	const [results, setResults] = useState<TestResult | null>(null);
	const [isRunning, setIsRunning] = useState(false);

	const { executeAction, renderLoginModal } = useAuthAction({
		requireAuth: true,
		authMessage: "Please sign in to run tests",
		onSuccess: () => {
			// Action completed successfully
		},
		onError: (error) => {
			console.error("Test execution failed:", error);
		},
	});

	const handleRunTests = async () => {
		if (!webContainer) return;

		try {
			setIsRunning(true);
			setResults(null);

			addTerminalOutput("🧪 Running tests...");

			// Run tests using the template's test command
			const testProcess = await webContainer.spawn("npm", ["run", "test"]);

			const outputChunks: string[] = [];
			testProcess.output.pipeTo(
				new WritableStream({
					write(data) {
						outputChunks.push(data);
						addTerminalOutput(data);
					},
				}),
			);

			const exitCode = await testProcess.exit;

			// Find the JSON object in the output chunks
			let jsonResult: VitestJsonResult | null = null;
			for (const chunk of outputChunks) {
				if (isJSON(chunk)) {
					const parsed = JSON.parse(chunk);
					if (parsed.testResults) {
						jsonResult = parsed;
						break;
					}
				}
			}

			if (jsonResult && jsonResult.testResults.length > 0) {
				setResults(jsonResult.testResults[0]); // Take the first test result
				const summary = `Tests: ${jsonResult.numPassedTests} passed, ${jsonResult.numFailedTests} failed, ${jsonResult.numTotalTests} total`;
				addTerminalOutput(exitCode === 0 ? `✅ ${summary}` : `❌ ${summary}`);
			} else {
				// Fallback if no JSON found - just show a message
				addTerminalOutput("⚠️ No test results found in output");
			}
		} catch (error) {
			addTerminalOutput(`❌ Error running tests: ${error}`);
		} finally {
			setIsRunning(false);
		}
	};

	const handleRunTestsWithAuth = () => {
		executeAction(handleRunTests);
	};

	return (
		<>
			<div className="flex flex-col  w-full border-t border-border relative rounded-xl p-4 gap-2 bg-gray-100 dark:bg-[#181825] h-full rounded-b-none">
				<Tabs defaultValue="test" className="flex-1 w-full ">
					<TabsList className="w-full justify-between rounded-none px-2 bg-transparent">
						<div className="flex gap-2">
							<TabsTrigger className="flex-0 px-4 opacity-80" value="test">
								<FlaskConical className="w-4 h-4 text-muted-foreground" />
								<span className="text-sm font-medium">Test</span>
							</TabsTrigger>
							<TabsTrigger className="flex-0 opacity-80 px-4" value="terminal">
								<TerminalIcon className="w-4 h-4 text-muted-foreground" />
								<span className="text-sm font-medium">Terminal</span>
							</TabsTrigger>
						</div>
						<RunButton
							onClick={handleRunTestsWithAuth}
							isRunning={isRunning}
							disabled={isRunning || !isTemplateReady}
						/>
					</TabsList>
					<TabsContent value="test" className="h-full w-full">
						<TestPanel results={results} isRunning={isRunning} />
					</TabsContent>
					<TabsContent value="terminal" className="h-full w-full">
						<Terminal output={terminalOutput} />
					</TabsContent>
				</Tabs>
			</div>

			{renderLoginModal()}
		</>
	);
}
