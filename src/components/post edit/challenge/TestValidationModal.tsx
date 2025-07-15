"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import React, { FC } from "react";

interface TestValidationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onProceed: () => void;
	isRunningTests: boolean;
	testResults: {
		numTotalTests: number;
		numPassedTests: number;
		numFailedTests: number;
		allTestsPassed: boolean;
	} | null;
	validationMessage: string;
	canProceed: boolean;
}

const TestValidationModal: FC<TestValidationModalProps> = ({
	isOpen,
	onClose,
	onProceed,
	isRunningTests,
	testResults,
	validationMessage,
	canProceed,
}) => {
	const getIcon = () => {
		if (isRunningTests) {
			return <Loader2 className="w-8 h-8 animate-spin text-blue-500" />;
		}
		if (testResults?.allTestsPassed) {
			return <CheckCircle2 className="w-8 h-8 text-green-500" />;
		}
		if (testResults && !testResults.allTestsPassed) {
			return <XCircle className="w-8 h-8 text-red-500" />;
		}
		return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
	};

	const getTitle = () => {
		if (isRunningTests) return "Running Tests...";
		if (testResults?.allTestsPassed) return "All Tests Passed!";
		if (testResults && !testResults.allTestsPassed) return "Tests Failed";
		return "Test Validation Required";
	};

	const getDescription = () => {
		if (isRunningTests) {
			return "Please wait while we validate your solution by running the test cases.";
		}
		return "Before proceeding to create the question template, we need to ensure your answer template passes all test cases.";
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="flex items-center justify-center mb-4">
						{getIcon()}
					</div>
					<DialogTitle className="text-center">{getTitle()}</DialogTitle>
					<DialogDescription className="text-center">
						{getDescription()}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{testResults && (
						<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
							<div className="grid grid-cols-3 gap-4 text-center">
								<div>
									<div className="text-2xl font-bold text-blue-600">
										{testResults.numTotalTests}
									</div>
									<div className="text-sm text-gray-600 dark:text-gray-400">
										Total
									</div>
								</div>
								<div>
									<div className="text-2xl font-bold text-green-600">
										{testResults.numPassedTests}
									</div>
									<div className="text-sm text-gray-600 dark:text-gray-400">
										Passed
									</div>
								</div>
								<div>
									<div className="text-2xl font-bold text-red-600">
										{testResults.numFailedTests}
									</div>
									<div className="text-sm text-gray-600 dark:text-gray-400">
										Failed
									</div>
								</div>
							</div>
						</div>
					)}

					<div className="text-center text-sm text-gray-600 dark:text-gray-400">
						{isRunningTests && !validationMessage
							? "Running tests, please wait..."
							: validationMessage}
					</div>

					<div className="flex gap-2 justify-end">
						<Button
							variant="outline"
							onClick={onClose}
							disabled={isRunningTests}
						>
							Cancel
						</Button>
						{canProceed && !isRunningTests && (
							<Button
								onClick={onProceed}
								className="bg-green-600 hover:bg-green-700 text-white"
							>
								Proceed
							</Button>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default TestValidationModal;
