import type { WebContainer } from "@webcontainer/api";

export interface AssertionResult {
	title: string;
	status: "passed" | "failed";
	failureMessages?: string[];
	duration?: number;
	ancestorTitles?: string[];
	fullName?: string;
	meta?: Record<string, unknown>;
}

export interface TestResult {
	name: string;
	status: "passed" | "failed";
	assertionResults: AssertionResult[];
	startTime?: number;
	endTime?: number;
	message?: string;
}

export interface VitestJsonResult {
	numTotalTests: number;
	numPassedTests: number;
	numFailedTests: number;
	testResults: TestResult[];
}

export interface TestExecutionResult {
	success: boolean;
	testResults: {
		numTotalTests: number;
		numPassedTests: number;
		numFailedTests: number;
		allTestsPassed: boolean;
	} | null;
	jsonResult: VitestJsonResult | null;
	exitCode: number;
}

export interface TestPanelProps {
	webContainer: WebContainer | null;
	addTerminalOutput: (output: string) => void;
	isTemplateReady: boolean;
}
