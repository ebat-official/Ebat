import { XMLParser } from "fast-xml-parser";

export interface TapTestResult {
	ancestorTitles: string[];
	fullName: string;
	status: "passed" | "failed";
	title: string;
	duration: number;
	failureMessages: string[];
	meta: Record<string, unknown>;
}

export interface TapParseResult {
	numTotalTestSuites: number;
	numPassedTestSuites: number;
	numFailedTestSuites: number;
	numPendingTestSuites: number;
	numTotalTests: number;
	numPassedTests: number;
	numFailedTests: number;
	numPendingTests: number;
	numTodoTests: number;
	snapshot: {
		added: number;
		failure: boolean;
		filesAdded: number;
		filesRemoved: number;
		filesRemovedList: string[];
		filesUnmatched: number;
		filesUpdated: number;
		matched: number;
		total: number;
		unchecked: number;
		uncheckedKeysByFile: string[];
		unmatched: number;
		updated: number;
		didUpdate: boolean;
	};
	startTime: number;
	success: boolean;
	testResults: Array<{
		assertionResults: TapTestResult[];
		startTime: number;
		endTime: number;
		status: "passed" | "failed";
		message: string;
		name: string;
	}>;
}

export function junitParser(chunks: string[]): TapParseResult {
	const xml = chunks.join("");
	const startTime = Date.now();

	const parser = new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: "",
		parseAttributeValue: true,
	});

	const parsed = parser.parse(xml);
	console.log(parsed, "parsed pran");
	const testsuites = parsed.testsuites;
	const testcases = Array.isArray(testsuites.testcase)
		? testsuites.testcase
		: testsuites.testcase
			? [testsuites.testcase]
			: [];

	const assertionResults: TapTestResult[] = [];
	let passCount = 0;
	let failCount = 0;

	for (const tc of testcases) {
		const title = tc.name ?? "Unnamed Test";
		const duration = typeof tc.time === "number" ? tc.time * 1000 : 0;

		const hasFailure = Boolean(tc.failure || tc.error);
		const failureMessages: string[] = [];

		if (hasFailure) {
			const failure = tc.failure || tc.error;
			if (typeof failure === "string") {
				failureMessages.push(failure);
			} else if (failure?.["#text"]) {
				failureMessages.push(failure["#text"]);
			}
		}

		assertionResults.push({
			ancestorTitles: [],
			fullName: title,
			status: hasFailure ? "failed" : "passed",
			title,
			duration,
			failureMessages,
			meta: {},
		});

		hasFailure ? failCount++ : passCount++;
	}

	const endTime = Date.now();

	return {
		numTotalTestSuites: 1,
		numPassedTestSuites: failCount === 0 ? 1 : 0,
		numFailedTestSuites: failCount > 0 ? 1 : 0,
		numPendingTestSuites: 0,
		numTotalTests: assertionResults.length,
		numPassedTests: passCount,
		numFailedTests: failCount,
		numPendingTests: 0,
		numTodoTests: 0,
		snapshot: {
			added: 0,
			failure: false,
			filesAdded: 0,
			filesRemoved: 0,
			filesRemovedList: [],
			filesUnmatched: 0,
			filesUpdated: 0,
			matched: 0,
			total: 0,
			unchecked: 0,
			uncheckedKeysByFile: [],
			unmatched: 0,
			updated: 0,
			didUpdate: false,
		},
		startTime,
		success: failCount === 0,
		testResults: [
			{
				assertionResults,
				startTime,
				endTime,
				status: failCount === 0 ? "passed" : "failed",
				message: "",
				name: "Status",
			},
		],
	};
}
