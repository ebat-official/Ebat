import React, { useState } from "react";
import { useWebContainerStore } from "../../store/webContainer";
import { Terminal } from "../terminal/terminal";
import { TestPanel } from "../test/TestPanel";
import {
	FlaskConical,
	TerminalIcon,
	Play,
	Loader2,
	Upload,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TestResult } from "../../types/test";
import RunButton from "../../RunButton";
import ButtonBlue from "../../../shared/ButtonBlue";
import { useAuthAction } from "@/hooks/useAuthAction";
import { useServerAction } from "@/hooks/useServerAction";
import { extractSolutionTemplate } from "../../utils/submissionUtils";
import { submitChallengeSolution } from "@/actions/submission";
import { toast } from "sonner";
import { PostType } from "@prisma/client";
import { ERROR } from "@/utils/contants";

export function BottomPanel() {
	const {
		terminalOutput,
		webContainer,
		addTerminalOutput,
		isTemplateReady,
		executeTests,
		post,
	} = useWebContainerStore();

	const [results, setResults] = useState<TestResult | null>(null);
	const [isRunning, setIsRunning] = useState(false);

	// Use useServerAction for submission with built-in loading state
	const [submitSolution, isSubmitting] = useServerAction(
		submitChallengeSolution,
	);

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

	const {
		executeAction: executeSubmissionAction,
		renderLoginModal: renderSubmissionLoginModal,
	} = useAuthAction({
		requireAuth: true,
		authMessage: "Please sign in to submit your solution",
		onSuccess: () => {
			// Submission completed successfully
		},
		onError: (error) => {
			console.error("Submission failed:", error);
		},
	});

	const handleRunTests = async () => {
		if (!webContainer) return;

		try {
			setIsRunning(true);
			setResults(null);

			const result = await executeTests();

			if (result.success && result.jsonResult && result.testResults) {
				setResults(result.jsonResult.testResults[0]); // Take the first test result
			} else {
				// Fallback if no results found
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

	const handleSubmitSolution = async () => {
		if (post?.type !== PostType.CHALLENGE) {
			toast.error("Submission is only available for challenges");
			return;
		}

		try {
			const { template, framework } = await extractSolutionTemplate();

			if (!template || !framework || !post?.id) {
				toast.error(
					"Unable to extract solution. Please ensure you have a valid template loaded.",
				);
				return;
			}

			const result = await submitSolution({
				postId: post.id,
				framework,
				answerTemplate: template,
			});

			if (result.status === ERROR) {
				toast.error(result.data?.message || "Failed to submit solution");
			} else {
				toast.success("Solution submitted successfully!");
			}
		} catch (error) {
			console.error("Submission error:", error);
			toast.error("An error occurred while submitting your solution");
		}
	};

	const handleSubmitSolutionWithAuth = () => {
		executeSubmissionAction(handleSubmitSolution);
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
						<div className="flex gap-4">
							<RunButton
								onClick={handleRunTestsWithAuth}
								isRunning={isRunning}
								disabled={isRunning || !isTemplateReady}
							/>
							{post?.type === PostType.CHALLENGE && (
								<ButtonBlue
									onClick={handleSubmitSolutionWithAuth}
									disabled={isSubmitting || !isTemplateReady}
									loading={isSubmitting}
									loadingText="Submitting..."
								>
									Submit
									<Upload className="w-4 h-4 ml-2" />
								</ButtonBlue>
							)}
						</div>
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
			{renderSubmissionLoginModal()}
		</>
	);
}
