import React, { FC } from "react";
import type { TemplateStep } from "./StepIndicator";
import { TemplateFramework } from "@/db/schema/enums";

interface StepDescriptionProps {
	currentStep: TemplateStep;
	framework: string;
}

const StepDescription: FC<StepDescriptionProps> = ({
	currentStep,
	framework,
}) => {
	const getTestingFramework = () => {
		const frameworkLower = framework.toLowerCase();

		if (frameworkLower === TemplateFramework.JAVASCRIPT) {
			return "Node.js built-in test runner (node:test)";
		}

		if ([TemplateFramework.REACT, TemplateFramework.NEXTJS, TemplateFramework.VUE].includes(frameworkLower as TemplateFramework)) {
			return "Vitest";
		}

		if (frameworkLower === TemplateFramework.ANGULAR) {
			return "Jest";
		}

		// Default for vanillajs, sveltekit, and others
		return "Jest";
	};

	const getTestDirectory = () => {
		const frameworkLower = framework.toLowerCase();

		switch (frameworkLower) {
			case TemplateFramework.NEXTJS:
				return "src/app/__tests__";
			default:
				return "src/__tests__";
		}
	};

	const getDescription = () => {
		const testingFramework = getTestingFramework();
		const testDirectory = getTestDirectory();

		if (currentStep === "question") {
			return (
				<div className="space-y-4">
					<p className="text-sm text-muted-foreground">
						This is what users will see when they attempt to solve the
						challenge. Create a barebones template that users can fill in.
					</p>
					<div className="space-y-2">
						<h4 className="text-md font-medium text-foreground">Key Points:</h4>
						<ul className="text-sm text-muted-foreground space-y-1 ml-4">
							<li>• Provide function signatures and basic structure</li>
							<li>• Include clear problem description and requirements</li>
							<li>• Add helpful comments to guide users</li>
							<li>
								• Test cases from your solution will be automatically copied
								here
							</li>
							<li>
								• Ensure the template is complete enough for users to understand
								the problem
							</li>
						</ul>
					</div>
					<div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
						<p className="text-sm text-blue-700 dark:text-blue-300">
							💡 <strong>Tip:</strong> The template should be minimal but clear.
							Users should be able to understand what they need to implement
							just by looking at the function signature and comments.
						</p>
					</div>
				</div>
			);
		}

		return (
			<div className="space-y-4">
				<p className="text-sm text-muted-foreground">
					Create a complete, clean, and concise solution to the problem. This
					will serve as the reference implementation.
				</p>
				<div className="space-y-2">
					<h4 className="text-md font-medium text-foreground">
						Solution Requirements:
					</h4>
					<ul className="text-sm text-muted-foreground space-y-1 ml-4">
						<li>• Write clean, readable, and well-commented code</li>
						<li>• Follow best practices for {framework}</li>
						<li>• Ensure optimal time and space complexity</li>
						<li>• Handle edge cases properly</li>
						<li>• Make the solution educational and easy to understand</li>
					</ul>
				</div>
				<div className="space-y-2">
					<h4 className="text-md font-medium text-foreground">Test Cases:</h4>
					<ul className="text-sm text-muted-foreground space-y-1 ml-4">
						<li>
							• Create test cases under{" "}
							<code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
								{testDirectory}
							</code>
						</li>
						<li>
							• Use <strong>{testingFramework}</strong> as the testing framework
						</li>
						<li>
							• Include basic test cases, edge cases, and boundary conditions
						</li>
						<li>• Test both valid and invalid inputs</li>
						<li>• Ensure all test cases pass before submitting</li>
					</ul>
				</div>
				<div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-md">
					<p className="text-sm text-yellow-700 dark:text-yellow-300">
						⚠️ <strong>Important:</strong> Use ChatGPT or other AI tools to
						identify edge cases and ensure comprehensive test coverage. Make
						sure all test cases pass before submitting the solution.
					</p>
				</div>
				<div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md">
					<p className="text-sm text-green-700 dark:text-green-300">
						✅ <strong>Quality Check:</strong> Your solution should be
						production-ready and serve as a learning resource for other
						developers.
					</p>
				</div>
			</div>
		);
	};

	return <div className="flex-1 overflow-y-auto p-4">{getDescription()}</div>;
};

export default StepDescription;
