import React, { useState } from "react";
import { useWebContainerStore } from "../../store/webContainer";
import { Terminal } from "../terminal/terminal";
import { TestPanel } from "../test/TestPanel";
import {
	FlaskConical,
	Terminal as TerminalIcon,
	Play,
	Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { parseTestResults } from "../../lib/test-utils";
import { TestResult } from "../../types/test";
import RunButton from "../../RunButton";

export function BottomPanel() {
	const { terminalOutput, webContainer, addTerminalOutput, isTemplateReady } =
		useWebContainerStore();

	const [results, setResults] = useState<TestResult[]>([]);
	const [isRunning, setIsRunning] = useState(false);

	const handleRunTests = async () => {
		if (!webContainer) return;

		try {
			setIsRunning(true);
			setResults([]);

			addTerminalOutput("🧪 Running tests...");

			// Run tests using the template's test command
			const testProcess = await webContainer.spawn("npm", ["run", "test"]);

			let testOutput = "";
			testProcess.output.pipeTo(
				new WritableStream({
					write(data) {
						testOutput += data;
						addTerminalOutput(data);
					},
				}),
			);

			const exitCode = await testProcess.exit;
			// Parse test results from the output
			const parsedResults = parseTestResults(testOutput);
			setResults(parsedResults);

			// Add summary
			const passedTests = parsedResults.filter(
				(r) => r.status === "pass",
			).length;
			const failedTests = parsedResults.filter(
				(r) => r.status === "fail",
			).length;
			const summary = `Tests: ${passedTests} passed, ${failedTests} failed, ${parsedResults.length} total`;
			addTerminalOutput(exitCode === 0 ? `✅ ${summary}` : `❌ ${summary}`);
		} catch (error) {
			addTerminalOutput(`❌ Error running tests: ${error}`);
		} finally {
			setIsRunning(false);
		}
	};

	return (
		<div className="flex flex-col  w-full border-t border-border relative rounded-xl p-4 gap-2 bg-gray-100 dark:bg-[#181825] h-full rounded-b-none">
			<Tabs defaultValue="test" className="flex-1 w-full ">
				<TabsList className="w-full justify-between rounded-none py-8 px-2 bg-transparent">
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
						onClick={handleRunTests}
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
	);
}
