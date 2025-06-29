import React from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XCircle, AlertTriangle, Clock, Target } from "lucide-react";

interface SubmissionFailureModalProps {
	isOpen: boolean;
	onClose: () => void;
	runtime: number;
	numTestsPassed: number;
	numTotalTests: number;
	numTestsFailed: number;
}

export function SubmissionFailureModal({
	isOpen,
	onClose,
	runtime,
	numTestsPassed,
	numTotalTests,
	numTestsFailed,
}: SubmissionFailureModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-red-600">
						<AlertTriangle className="w-6 h-6" />
						Solution Not Accepted
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-6 py-4">
					<div className="text-center">
						<XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">
							Your Solution Didn't Pass All Test Cases
						</h3>
						<p className="text-muted-foreground">
							Some test cases failed. Please review your solution and try again.
						</p>
					</div>

					<div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Target className="w-4 h-4 text-red-600" />
								<span className="text-sm font-medium">Tests Passed</span>
							</div>
							<span className="text-sm font-semibold text-red-600">
								{numTestsPassed}/{numTotalTests}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<XCircle className="w-4 h-4 text-red-600" />
								<span className="text-sm font-medium">Tests Failed</span>
							</div>
							<span className="text-sm font-semibold text-red-600">
								{numTestsFailed}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Clock className="w-4 h-4 text-red-600" />
								<span className="text-sm font-medium">Runtime</span>
							</div>
							<span className="text-sm font-semibold text-red-600">
								{runtime}ms
							</span>
						</div>
					</div>

					<div className="text-center text-sm text-muted-foreground">
						Your solution has been submitted but didn't pass all test cases.
						Review the failing tests and improve your solution.
					</div>
				</div>

				<div className="flex justify-center">
					<Button onClick={onClose} variant="outline" className="w-full">
						Try Again
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
