import { XCircle, CheckCircle2 } from "lucide-react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { TestResult, AssertionResult } from "../../types/test";

interface TestResultItemProps {
	result: TestResult;
	index: number;
}

// Function to format duration in a readable way
function formatDuration(duration: number): string {
	if (duration < 1000) {
		return `${duration.toFixed(0)}ms`;
	}
	return `${(duration / 1000).toFixed(2)}s`;
}

export function TestResultItem({ result, index }: TestResultItemProps) {
	return (
		<div className="space-y-2 max-h-40 overflow-y-auto py-4">
			{/* Individual test cases */}
			<Accordion type="multiple" className="w-full">
				{result.assertionResults.map((assertion, assertionIndex) => (
					<AccordionItem
						key={`${index}-${assertionIndex}`}
						value={`item-${index}-${assertionIndex}`}
						className={`rounded-lg border ${
							assertion.status === "passed"
								? "border-green-200 bg-green-50 dark:bg-green-950/30"
								: "border-red-200 bg-red-50 dark:bg-red-950/30"
						}`}
					>
						<AccordionTrigger className="px-4 hover:no-underline">
							<div className="flex items-center gap-2 flex-1">
								{assertion.status === "passed" ? (
									<CheckCircle2 className="w-4 h-4 text-green-500" />
								) : (
									<XCircle className="w-4 h-4 text-red-500" />
								)}
								<div className="flex gap-2 items-center">
									<span className="font-medium text-sm">
										{assertion.title || assertion.title}
									</span>
									<span className="text-xs text-muted-foreground">
										({formatDuration(assertion.duration || 0)})
									</span>
								</div>
							</div>
						</AccordionTrigger>
						<AccordionContent className="px-4">
							{assertion.status === "passed" ? (
								<div className="py-2 text-sm text-green-600 dark:text-green-400">
									Test passed successfully ✨
								</div>
							) : assertion.failureMessages &&
								assertion.failureMessages.length > 0 ? (
								<pre className="text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap overflow-auto font-mono bg-red-50/10 p-4 rounded-md border border-red-200/20">
									{assertion.failureMessages.join("\n")}
								</pre>
							) : (
								<div className="py-2 text-sm text-red-600 dark:text-red-400">
									Test failed
								</div>
							)}
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</div>
	);
}
