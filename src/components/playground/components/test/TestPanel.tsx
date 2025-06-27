"use client";

import React from "react";
import { Clock } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { TestResultItem } from "./TestResultAccordian";
import { TestResult } from "../../types/test";

interface TestPanelProps {
	results: TestResult[];
	isRunning: boolean;
}

export function TestPanel({ results, isRunning }: TestPanelProps) {
	return (
		<div className="h-full bg-transparent flex flex-col min-h-0">
			<div className="max-h-48 overflow-y-scroll p-4 py-8">
				<div className="space-y-2">
					<Accordion type="single" collapsible className="w-full">
						{results.map((result, index) => (
							<TestResultItem key={index} result={result} index={index} />
						))}
					</Accordion>
					{results.length === 0 && !isRunning && (
						<div
							className="h-full flex flex-col items-center justify-center text-gray-500 bg-gray-100/50 dark:bg-[#1e1e2e]/50 backdrop-blur-sm border dark:border-[#313244] 
        rounded-xl p-4"
						>
							<div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4 ring-1 ring-gray-800/50 mb-4">
								<Clock className="w-6 h-6" />
							</div>
							<p className="text-center">
								Run your code to see the output here...
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
