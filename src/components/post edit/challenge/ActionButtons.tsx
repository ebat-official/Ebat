import React, { FC } from "react";
import ButtonBlue from "@/components/shared/ButtonBlue";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { TemplateStep } from "./StepIndicator";
import type { FileSystemTree } from "../../playground/lib/types";
import ProgressIndicators from "./ProgressIndicators";

interface ActionButtonsProps {
	currentStep: TemplateStep;
	isLoading: boolean;
	isSaving: boolean;
	canProceed: boolean;
	canSave: boolean;
	onNext: () => void;
	onBack: () => void;
	onSave: () => void;
	answerTemplate: FileSystemTree | null;
	files: FileSystemTree | null;
}

const ActionButtons: FC<ActionButtonsProps> = ({
	currentStep,
	isLoading,
	isSaving,
	canProceed,
	canSave,
	onNext,
	onBack,
	onSave,
	answerTemplate,
	files,
}) => (
	<div className="flex justify-between items-center p-4 border-t-2">
		{/* Left side - Back button */}
		<div className="flex-1">
			{currentStep === "question" && (
				<Button
					onClick={onBack}
					disabled={isLoading}
					variant="outline"
					className="px-8 py-2"
				>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Loading...
						</>
					) : (
						"Back"
					)}
				</Button>
			)}
		</div>

		{/* Center - Progress indicators */}
		<ProgressIndicators
			answerTemplate={answerTemplate}
			currentStep={currentStep}
			files={files}
		/>

		{/* Right side - Next/Save button */}
		<div className="flex-1 flex justify-end">
			{currentStep === "answer" ? (
				<Button
					onClick={onNext}
					disabled={!canProceed || isLoading}
					variant="outline"
					className="px-8 py-2"
				>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Loading...
						</>
					) : (
						"Next"
					)}
				</Button>
			) : (
				<ButtonBlue
					onClick={onSave}
					disabled={!canSave || isSaving}
					loading={isSaving}
					loadingText="Saving..."
				>
					Save Templates
				</ButtonBlue>
			)}
		</div>
	</div>
);

export default ActionButtons;
