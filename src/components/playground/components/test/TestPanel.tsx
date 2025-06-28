"use client";

import React from "react";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { TestResultItem } from "./TestResultAccordian";
import { TestResult } from "../../types/test";

interface TestPanelProps {
	results: TestResult | null;
	isRunning: boolean;
}

// Function to format duration in a readable way
function formatDuration(duration: number): string {
	if (duration < 1000) {
		return `${duration.toFixed(0)}ms`;
	}
	return `${(duration / 1000).toFixed(2)}s`;
}

export function TestPanel({ results, isRunning }: TestPanelProps) {
	if (!results) {
		return (
			<div className="h-full bg-transparent flex flex-col min-h-0">
				<div className="flex-1 overflow-y-auto p-4">
					<div className="space-y-4">
						{!isRunning && (
							<div
								className="h-full flex flex-col items-center justify-center text-gray-500 bg-gray-100/50 dark:bg-[#1e1e2e]/50 backdrop-blur-sm border dark:border-[#313244] 
        rounded-xl p-4"
							>
								<div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4 ring-1 ring-gray-800/50 mb-4">
									<Clock className="w-6 h-6" />
								</div>
								<p className="text-center">
									Run your tests to see the results here...
								</p>
							</div>
						)}
						{isRunning && (
							<div className="text-center text-muted-foreground py-8">
								Running tests...
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	const passedTests = results.assertionResults.filter(
		(assertion) => assertion.status === "passed",
	).length;
	const totalTests = results.assertionResults.length;

	// Calculate total duration from all assertions
	const totalDuration = results.assertionResults.reduce(
		(sum, assertion) => sum + (assertion.duration || 0),
		0,
	);

	return (
		<div className="h-full bg-transparent flex flex-col min-h-0">
			{/* File-level summary */}
			<div className="border-b border-border/50 p-2">
				<div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
					{results.status === "passed" ? (
						<CheckCircle2 className="w-4 h-4 text-green-500" />
					) : (
						<XCircle className="w-4 h-4 text-red-500" />
					)}
					<span className="text-sm font-medium">
						{results.name
							.split("/")
							.pop()
							?.replace(/\.(test|spec)\.(js|ts|jsx|tsx)$/, "") || results.name}
					</span>
					<span className="text-xs text-muted-foreground">
						{passedTests}/{totalTests} tests passed •{" "}
						{formatDuration(totalDuration)}
					</span>
				</div>
			</div>

			<TestResultItem result={results} index={0} />
		</div>
	);
}
