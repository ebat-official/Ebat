import React, { FC } from "react";

type TemplateStep = "question" | "answer";

interface StepIndicatorProps {
	currentStep: TemplateStep;
	framework: string;
}

const StepIndicator: FC<StepIndicatorProps> = ({ currentStep, framework }) => (
	<div className="flex items-center gap-2 mb-4">
		<div className="flex items-center gap-2">
			<div
				className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
					currentStep === "question"
						? "bg-green-500 text-white"
						: "bg-blue-500 text-white"
				}`}
			>
				{currentStep === "question" ? "2" : "1"}
			</div>
			<h3 className="text-lg font-semibold">
				{currentStep === "question" ? "Question Template" : "Solution"}
			</h3>
		</div>
	</div>
);

export default StepIndicator;
export type { TemplateStep };
