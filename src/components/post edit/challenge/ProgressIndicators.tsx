import React, { FC } from "react";
import type { TemplateStep } from "./StepIndicator";
import type { FileSystemTree, Template } from "../../playground/lib/types";

interface ProgressIndicatorsProps {
	answerTemplate: Template | null;
	currentStep: TemplateStep;
	files: FileSystemTree | null;
}

const ProgressIndicators: FC<ProgressIndicatorsProps> = ({
	answerTemplate,
	currentStep,
	files,
}) => (
	<div className="flex items-center gap-4">
		<div className="flex items-center gap-2">
			<div
				className={`w-4 h-4 rounded-full ${
					answerTemplate ? "bg-green-500" : "bg-gray-300"
				}`}
			/>
			<span className="text-sm">Solution</span>
		</div>
		<div className="flex items-center gap-2">
			<div
				className={`w-4 h-4 rounded-full ${
					currentStep === "question" && files && Object.keys(files).length > 0
						? "bg-green-500"
						: "bg-gray-300"
				}`}
			/>
			<span className="text-sm">Question Template</span>
		</div>
	</div>
);

export default ProgressIndicators;
