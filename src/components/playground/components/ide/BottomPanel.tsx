import { submitChallengeSolution } from "@/actions/submission";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostType, SubmissionStatus } from "@/db/schema/enums";
import { useAuthAction } from "@/hooks/useAuthAction";
import { useServerAction } from "@/hooks/useServerAction";
import { useCompletionStatusStore } from "@/store/useCompletionStatusStore";
import { ERROR } from "@/utils/constants";
import {
	FlaskConical,
	Loader2,
	Play,
	TerminalIcon,
	Upload,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import ButtonBlue from "../../../shared/ButtonBlue";
import RunButton from "../../RunButton";
import { useWebContainerStore } from "../../store/webContainer";
import { TestResult } from "../../types/test";
import { extractSolutionTemplate } from "../../utils/submissionUtils";
import { Terminal } from "../terminal/terminal";
import { TestPanel } from "../test/TestPanel";
import { SubmissionFailureModal } from "./SubmissionFailureModal";
import { SubmissionSuccessModal } from "./SubmissionSuccessModal";

export function BottomPanel() {
	const {
		terminalOutput,
		webContainer,
		addTerminalOutput,
		isTemplateReady,
		executeTests,
		post,
	} = useWebContainerStore();

	const { updateCompletionStatus } = useCompletionStatusStore();

	const [results, setResults] = useState<TestResult | null>(null);
	const [isRunning, setIsRunning] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [showFailureModal, setShowFailureModal] = useState(false);
	const [isJudging, setIsJudging] = useState(false);
	const [submissionResults, setSubmissionResults] = useState<{
		runtime: number;
		numTestsPassed: number;
		numTotalTests: number;
		numTestsFailed?: number;
	} | null>(null);

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

		setIsJudging(true);
		try {
			// First, run the tests to get runtime and status
			addTerminalOutput("🧪 Running tests for submission...");
			const testResult = await executeTests();

			if (
				!testResult.success ||
				!testResult.testResults ||
				!testResult.jsonResult
			) {
				toast.error(
					"Failed to run tests. Please ensure your solution is valid.",
				);
				return;
			}

			// Calculate runtime from test results
			let totalRuntime = 0;
			if (
				testResult.jsonResult.testResults &&
				testResult.jsonResult.testResults.length > 0
			) {
				// Calculate total runtime from all test results
				for (const test of testResult.jsonResult.testResults) {
					if (test.startTime && test.endTime) {
						totalRuntime += test.endTime - test.startTime;
					} else if (test.assertionResults) {
						// Fallback: sum up individual assertion durations
						for (const assertion of test.assertionResults) {
							if (assertion.duration) {
								totalRuntime += assertion.duration;
							}
						}
					}
				}
			}

			// Determine status based on test results
			const submissionStatus = testResult.testResults.allTestsPassed
				? SubmissionStatus.ACCEPTED
				: SubmissionStatus.REJECTED;

			// Extract solution template
			const { template, framework } = await extractSolutionTemplate();

			if (!template || !framework || !post?.id) {
				toast.error(
					"Unable to extract solution. Please ensure you have a valid template loaded.",
				);
				return;
			}

			// Submit the solution with calculated runtime and status
			const result = await submitSolution({
				postId: post.id,
				framework,
				answerTemplate: template,
				runTime: Math.round(totalRuntime), // Ensure runtime is an integer
				status: submissionStatus,
			});

			if (result.status === ERROR) {
				toast.error(result.data?.message || "Failed to submit solution");
			} else {
				// Prepare results for modal
				const results = {
					runtime: Math.round(totalRuntime),
					numTestsPassed: testResult.testResults.numPassedTests,
					numTotalTests: testResult.testResults.numTotalTests,
					numTestsFailed: testResult.testResults.numFailedTests,
				};
				setSubmissionResults(results);

				// Show appropriate modal based on test results
				if (submissionStatus === SubmissionStatus.ACCEPTED) {
					// Mark the challenge as completed when submission is successful
					updateCompletionStatus(post.id, true);
					setShowSuccessModal(true);
				} else {
					setShowFailureModal(true);
				}
			}
		} catch (error) {
			console.error("Submission error:", error);
			toast.error("An error occurred while submitting your solution");
		} finally {
			setIsJudging(false);
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
									disabled={isJudging || isSubmitting || !isTemplateReady}
									loading={isJudging || isSubmitting}
									loadingText="Judging..."
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

			{showSuccessModal && submissionResults && (
				<SubmissionSuccessModal
					isOpen={showSuccessModal}
					onClose={() => setShowSuccessModal(false)}
					runtime={submissionResults.runtime}
					numTestsPassed={submissionResults.numTestsPassed}
					numTotalTests={submissionResults.numTotalTests}
				/>
			)}

			{showFailureModal && submissionResults && (
				<SubmissionFailureModal
					isOpen={showFailureModal}
					onClose={() => setShowFailureModal(false)}
					runtime={submissionResults.runtime}
					numTestsPassed={submissionResults.numTestsPassed}
					numTotalTests={submissionResults.numTotalTests}
					numTestsFailed={submissionResults.numTestsFailed || 0}
				/>
			)}
		</>
	);
}
