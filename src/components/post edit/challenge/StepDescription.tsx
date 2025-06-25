import React, { FC } from "react";
import type { TemplateStep } from "./StepIndicator";

interface StepDescriptionProps {
	currentStep: TemplateStep;
	framework: string;
}

const StepDescription: FC<StepDescriptionProps> = ({
	currentStep,
	framework,
}) => {
	const description =
		currentStep === "question"
			? `Create the question template for ${framework.toLowerCase()} framework. This will be the starting point that users will see when they begin the challenge.`
			: `Create the answer template for ${framework.toLowerCase()} framework. This will be the solution that users can reference.`;

	return (
		<div className="flex-1 overflow-y-auto">
			<p className="text-sm text-muted-foreground">{description}</p>
		</div>
	);
};

export default StepDescription;
