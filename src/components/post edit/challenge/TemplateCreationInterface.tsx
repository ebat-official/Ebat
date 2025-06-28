"use client";
import React, { FC, useCallback, useMemo, useState, useEffect } from "react";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { OnlineIDE } from "../../playground/components/OnlineIde";
import { BottomPanel } from "../../playground/components/ide/BottomPanel";
import { PreviewPanel } from "../../playground/components/preview/PreviewPanel";
import { useWebContainerStore } from "../../playground/store/webContainer";
import { Card } from "@/components/ui/card";
import { TemplateFramework } from "@prisma/client";
import { extractSrcFromTemplate } from "../../playground/utils/templateUtils";
import type { Template } from "../../playground/lib/types";
import {
	StepIndicator,
	StepDescription,
	LoadingOverlay,
	ActionButtons,
	TestValidationModal,
} from "./index";
import DefaultFileSelector from "./DefaultFileSelector";
import { useTemplateManagement } from "../../playground/hooks";

type TemplateStep = "answer" | "question";

interface TemplateCreationInterfaceProps {
	selectedFramework: TemplateFramework;
	onSave: (templates: {
		framework: TemplateFramework;
		questionTemplate: Template;
		answerTemplate: Template;
	}) => void;
	editingTemplate?: {
		framework: TemplateFramework;
		questionTemplate: Template;
		answerTemplate: Template;
	} | null;
}

const TemplateCreationInterface: FC<TemplateCreationInterfaceProps> = ({
	selectedFramework,
	onSave,
	editingTemplate,
}) => {
	const {
		selectedTemplate,
		answerTemplate,
		questionTemplate,
		setAnswerTemplate,
		setQuestionTemplate,
		updateDefaultFile,
		createTemplateWithDefaultFile,
	} = useTemplateManagement(editingTemplate, selectedFramework);

	// Simple state management
	const [currentStep, setCurrentStep] = useState<TemplateStep>("answer");
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [showTestValidationModal, setShowTestValidationModal] = useState(false);
	const [validationMessage, setValidationMessage] = useState("");

	const {
		files,
		getFileTree,
		stopServer,
		testResults,
		isRunningTests,
		runTestsForValidation,
		clearTestResults,
	} = useWebContainerStore();

	// Cleanup container on component unmount
	useEffect(() => {
		return () => {
			stopServer();
		};
	}, []);

	// Memoized computed values
	const canProceed = useMemo(
		() => !!(files && Object.keys(files).length > 0),
		[files],
	);

	const canSave = useMemo(
		() => !!(answerTemplate && files),
		[answerTemplate, files],
	);

	// Test validation handler
	const handleTestValidation = useCallback(async () => {
		// Clear validation message while tests are running
		setValidationMessage("");

		const result = await runTestsForValidation();

		// Only set validation message after tests complete
		setValidationMessage(result.message);

		if (result.success && result.hasTests) {
			// All tests passed, proceed to next step
			return true;
		}

		// Tests failed or no tests found
		return false;
	}, [runTestsForValidation]);

	// Template transition handlers
	const handleNext = useCallback(async () => {
		if (currentStep !== "answer") return;

		// Show test validation modal and clear all previous state
		setShowTestValidationModal(true);
		setValidationMessage(""); // Clear previous validation message
		clearTestResults();

		// Run tests but don't auto-proceed, let user click "Proceed" button
		await handleTestValidation();
	}, [currentStep, handleTestValidation, clearTestResults]);

	const proceedToQuestionStep = useCallback(async () => {
		setIsLoading(true);
		try {
			const currentFiles = await getFileTree(".");
			if (currentFiles && selectedTemplate) {
				const cleanTemplate = extractSrcFromTemplate(
					currentFiles,
					selectedTemplate,
				);

				const templateWithDefaultFile = createTemplateWithDefaultFile(
					cleanTemplate,
					selectedTemplate.defaultFile,
				);

				// Set both templates with the same defaultFile
				setAnswerTemplate(templateWithDefaultFile);
				setQuestionTemplate(templateWithDefaultFile);
			}
			setCurrentStep("question");
		} catch (error) {
			console.error("Error during template transition:", error);
		} finally {
			setIsLoading(false);
		}
	}, [
		selectedTemplate,
		getFileTree,
		createTemplateWithDefaultFile,
		setAnswerTemplate,
		setQuestionTemplate,
		setCurrentStep,
	]);

	const handleProceedClick = useCallback(async () => {
		// Close modal immediately for better UX
		setShowTestValidationModal(false);
		// Then proceed with template creation
		await proceedToQuestionStep();
	}, [proceedToQuestionStep]);

	const handleBack = useCallback(async () => {
		if (currentStep !== "question") return;

		setIsLoading(true);
		try {
			setCurrentStep("answer");
			if (answerTemplate) {
				const { selectTemplate } = useWebContainerStore.getState();
				await selectTemplate(answerTemplate);
			}
		} catch (error) {
			console.error("Error during template transition:", error);
		} finally {
			setIsLoading(false);
		}
	}, [currentStep, answerTemplate, setCurrentStep]);

	// Save handler
	const handleSave = useCallback(async () => {
		setIsSaving(true);
		try {
			const currentQuestionTemplate = await getFileTree(".");
			if (!answerTemplate || !currentQuestionTemplate || !selectedTemplate) {
				throw new Error("Missing required data for saving");
			}

			const cleanQuestionTemplate = extractSrcFromTemplate(
				currentQuestionTemplate,
				selectedTemplate,
			);

			const defaultFile =
				cleanQuestionTemplate.defaultFile || selectedTemplate.defaultFile;

			// Ensure both templates have the same defaultFile
			const finalAnswerTemplate = createTemplateWithDefaultFile(
				answerTemplate,
				defaultFile,
			);
			const finalQuestionTemplateWithDefaultFile =
				createTemplateWithDefaultFile(cleanQuestionTemplate, defaultFile);

			const savedTemplate = {
				framework: selectedFramework,
				questionTemplate: finalQuestionTemplateWithDefaultFile,
				answerTemplate: finalAnswerTemplate,
			};

			onSave(savedTemplate);
		} catch (error) {
			console.error("Error saving templates:", error);
		} finally {
			setIsSaving(false);
		}
	}, [
		answerTemplate,
		questionTemplate,
		selectedTemplate,
		selectedFramework,
		getFileTree,
		createTemplateWithDefaultFile,
		onSave,
	]);

	// Default file change handler
	const handleDefaultFileChange = useCallback(
		(defaultFile: string) => {
			updateDefaultFile(defaultFile);
		},
		[updateDefaultFile],
	);

	return (
		<div className="h-full flex flex-col justify-between relative overflow-auto-y ">
			<LoadingOverlay isLoading={isLoading} isSaving={isSaving} />

			<ResizablePanelGroup
				className="max-w-screen p-2 !flex-col md:!flex-row flex-1"
				direction="horizontal"
			>
				<ResizablePanel
					defaultSize={30}
					className="!basis-auto md:!basis-0 md:max-h-[calc(100vh-80px)]"
				>
					<Card className="h-full w-full p-4">
						<div className="flex flex-col h-full">
							<StepIndicator
								currentStep={currentStep}
								framework={selectedFramework}
							/>
							<StepDescription
								currentStep={currentStep}
								framework={selectedFramework}
							/>
							{currentStep === "question" && (
								<DefaultFileSelector
									files={files}
									selectedTemplate={questionTemplate || selectedTemplate}
									onDefaultFileChange={handleDefaultFileChange}
								/>
							)}
						</div>
					</Card>
				</ResizablePanel>

				<ResizableHandle withHandle className="hidden md:flex bg-transparent" />

				<ResizablePanel className="!basis-auto md:!basis-0">
					<Card className="h-full w-full py-0">
						<ResizablePanelGroup direction="vertical" className="!flex-col">
							<ResizablePanel className="flex-1 !basis-auto md:!basis-0">
								<ResizablePanelGroup
									direction="horizontal"
									className="!flex-col md:!flex-row"
								>
									<ResizablePanel
										defaultSize={60}
										className="!basis-auto md:!basis-0 rounded-t-xl"
									>
										<OnlineIDE />
									</ResizablePanel>
									{selectedTemplate &&
										selectedTemplate.hasPreview !== false && (
											<>
												<ResizableHandle
													withHandle
													className="hidden md:flex bg-transparent"
												/>
												<ResizablePanel className="!basis-auto md:!basis-0">
													<PreviewPanel selectedTemplate={selectedTemplate} />
												</ResizablePanel>
											</>
										)}
								</ResizablePanelGroup>
							</ResizablePanel>
							<ResizableHandle
								withHandle
								className="hidden md:flex bg-transparent"
							/>
							<ResizablePanel
								defaultSize={30}
								className="!basis-auto md:!basis-0"
							>
								<BottomPanel />
							</ResizablePanel>
						</ResizablePanelGroup>
					</Card>
				</ResizablePanel>
			</ResizablePanelGroup>

			<ActionButtons
				currentStep={currentStep}
				isLoading={isLoading}
				isSaving={isSaving}
				canProceed={canProceed}
				canSave={canSave}
				onNext={handleNext}
				onBack={handleBack}
				onSave={handleSave}
				answerTemplate={answerTemplate}
				files={files}
			/>

			{showTestValidationModal && (
				<TestValidationModal
					isOpen={showTestValidationModal}
					onClose={() => setShowTestValidationModal(false)}
					onProceed={handleProceedClick}
					isRunningTests={isRunningTests}
					testResults={testResults}
					validationMessage={validationMessage}
					canProceed={testResults?.allTestsPassed || false}
				/>
			)}
		</div>
	);
};

export default TemplateCreationInterface;
