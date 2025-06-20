import { TestResult } from "../types/test";

// Function to clean ANSI escape codes and control characters
export function cleanOutput(str: string): string {
	// Remove ANSI escape codes
	str = str.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, "");
	// Remove carriage returns and null characters
	str = str.replace(/\r|\u0000/g, "");
	// Remove backspace characters and the character they would erase
	str = str.replace(/.\x08/g, "");
	// Clean up multiple newlines
	str = str.replace(/\n\s*\n/g, "\n");
	return str;
}

interface ParsedTestInfo {
	name: string;
	duration: string;
}

export function parseTestNameAndDuration(rawTestName: string): ParsedTestInfo {
	const parts = rawTestName.match(/(.*?)\s*\((\d+\.?\d*)\s*ms\)/);
	if (parts) {
		return {
			name: parts[1].trim(),
			duration: `${parts[2]}ms`,
		};
	}
	return {
		name: rawTestName,
		duration: "10ms",
	};
}

export function parseTestResults(output: string): TestResult[] {
	const testResults: TestResult[] = [];
	const lines = cleanOutput(output).split("\n");

	let currentError = "";
	let isCollectingError = false;
	let currentFailedTest: TestResult | null = null;
	let hasStartedTests = false;

	for (const line of lines) {
		const cleanLine = line.trim();

		// Skip empty lines and noise
		if (
			!cleanLine ||
			cleanLine.startsWith("Determining") ||
			cleanLine.startsWith("RUNS") ||
			cleanLine.startsWith("Progress:") ||
			cleanLine.startsWith("WARN") ||
			cleanLine.startsWith("Packages:") ||
			cleanLine.startsWith("dependencies:") ||
			cleanLine.startsWith("Done in") ||
			cleanLine.startsWith("✅") ||
			cleanLine.startsWith("🔥") ||
			cleanLine.startsWith("VITE") ||
			cleanLine.startsWith("➜") ||
			cleanLine.startsWith("🧪") ||
			cleanLine.startsWith("ℹ tests") ||
			cleanLine.startsWith("ℹ suites") ||
			cleanLine.startsWith("ℹ pass") ||
			cleanLine.startsWith("ℹ fail") ||
			cleanLine.startsWith("ℹ cancelled") ||
			cleanLine.startsWith("ℹ skipped") ||
			cleanLine.startsWith("ℹ todo") ||
			cleanLine.startsWith("ℹ duration_ms")
		) {
			continue;
		}

		// Start collecting results after we see the first test result
		if (
			cleanLine.includes("✓") ||
			cleanLine.includes("✕") ||
			cleanLine.includes("✔") ||
			cleanLine.includes("✖")
		) {
			hasStartedTests = true;
		}

		if (!hasStartedTests) {
			continue;
		}

		// Handle both Jest (✓/✕) and Node (✔/✖) test indicators
		if (cleanLine.includes("✓") || cleanLine.includes("✔")) {
			const testName = cleanLine.split(/[✓✔]/)[1].trim();
			const durationMatch = testName.match(/\((\d+\.?\d*)\s*ms\)$/);
			const duration = durationMatch ? `${durationMatch[1]}ms` : "10ms";
			const name = testName.replace(/\(\d+\.?\d*\s*ms\)$/, "").trim();
			testResults.push({
				name: `${name} (${duration})`,
				status: "pass",
			});
		} else if (cleanLine.includes("✕") || cleanLine.includes("✖")) {
			const testName = cleanLine.split(/[✕✖]/)[1].trim();
			const durationMatch = testName.match(/\((\d+\.?\d*)\s*ms\)$/);
			const duration = durationMatch ? `${durationMatch[1]}ms` : "10ms";
			const name = testName.replace(/\(\d+\.?\d*\s*ms\)$/, "").trim();
			currentFailedTest = {
				name: `${name} (${duration})`,
				status: "fail",
				error: { message: "" },
			};
			testResults.push(currentFailedTest);
			isCollectingError = true;
		} else if (isCollectingError && currentFailedTest) {
			// Skip summary lines
			if (
				cleanLine.startsWith("Test Suites:") ||
				cleanLine.startsWith("Tests:") ||
				cleanLine.startsWith("Snapshots:") ||
				cleanLine.startsWith("Time:") ||
				cleanLine.startsWith("Ran all test suites") ||
				cleanLine.startsWith("ℹ")
			) {
				isCollectingError = false;
				continue;
			}

			// Collect all lines until we hit the summary
			currentError += cleanLine + "\n";
			currentFailedTest.error = { message: currentError };
		}
	}

	return testResults;
}
