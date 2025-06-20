import type { WebContainer } from "@webcontainer/api";

export interface TestResult {
	name: string;
	status: "pass" | "fail";
	message?: string;
	duration?: number;
	error?: {
		message: string;
		stack?: string;
	};
}

export interface TestPanelProps {
	webContainer: WebContainer | null;
	addTerminalOutput: (output: string) => void;
	isTemplateReady: boolean;
}
