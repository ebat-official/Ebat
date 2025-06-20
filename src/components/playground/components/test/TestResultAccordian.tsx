import { XCircle, CheckCircle2 } from "lucide-react";
import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { TestResult } from "../../types/test";
import { parseTestNameAndDuration } from "../../lib/test-utils";

interface TestResultItemProps {
	result: TestResult;
	index: number;
}

export function TestResultItem({ result, index }: TestResultItemProps) {
	const { name, duration } = parseTestNameAndDuration(result.name);

	return (
		<AccordionItem
			value={`item-${index}`}
			className={`rounded-lg border mb-2 ${
				result.status === "pass"
					? "border-green-200 bg-green-50 dark:bg-green-950/30"
					: "border-red-200 bg-red-50 dark:bg-red-950/30"
			}`}
		>
			<AccordionTrigger className="px-4 hover:no-underline">
				<div className="flex items-center gap-2 flex-1">
					{result.status === "pass" ? (
						<CheckCircle2 className="w-5 h-5 text-green-500" />
					) : (
						<XCircle className="w-5 h-5 text-red-500" />
					)}
					<span className="font-medium">{name}</span>
				</div>
			</AccordionTrigger>
			<AccordionContent className="px-4">
				{result.status === "pass" ? (
					<div className="py-2 text-sm text-green-600 dark:text-green-400">
						Test completed successfully in {duration} ✨
					</div>
				) : result.error ? (
					<pre className="mt-2 text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap overflow-auto font-mono bg-red-50/10 p-4 rounded-md border border-red-200/20">
						{result.error.message}
						{result.error.stack && <div>\n{result.error.stack}</div>}
					</pre>
				) : null}
			</AccordionContent>
		</AccordionItem>
	);
}
