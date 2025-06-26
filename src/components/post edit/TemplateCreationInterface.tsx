"use client";
import React, { FC, useEffect, useState } from "react";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { OnlineIDE } from "../playground/components/OnlineIde";
import { BottomPanel } from "../playground/components/ide/BottomPanel";
import { PreviewPanel } from "../playground/components/preview/PreviewPanel";
import { useWebContainerStore } from "../playground/store/webContainer";
import { Card } from "@/components/ui/card";
import { TemplateFramework } from "@prisma/client";
import {
	handleTemplateSelect,
	extractSrcFromTemplate,
} from "../playground/utils/templateUtils";
import type { FileSystemTree, Template } from "../playground/lib/types";
import {
	StepIndicator,
	StepDescription,
	LoadingOverlay,
	ActionButtons,
	type TemplateStep,
} from "./challenge/index";
import DefaultFileSelector from "./challenge/DefaultFileSelector";

interface TemplateCreationInterfaceProps {
	selectedFramework: TemplateFramework;
	onSave: (templates: {
		framework: TemplateFramework;
		questionTemplate: Template;
		answerTemplate: Template;
		defaultFile?: string;
	}) => void;
	editingTemplate?: {
		framework: TemplateFramework;
		questionTemplate: Template;
		answerTemplate: Template;
		defaultFile?: string;
	} | null;
}

const TemplateCreationInterface: FC<TemplateCreationInterfaceProps> = ({
	selectedFramework,
	onSave,
	editingTemplate,
}) => {
	const {
		selectedTemplate,
		isContainerReady,
		files,
		getFileTree,
		webContainer,
		setFiles,
		clearOpenFiles,
		handleFileSelect,
		selectTemplate,
	} = useWebContainerStore();
	const [currentStep, setCurrentStep] = useState<TemplateStep>("answer");
	const [answerTemplate, setAnswerTemplate] = useState<Template | null>(
		editingTemplate?.answerTemplate || null,
	);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [selectedDefaultFile, setSelectedDefaultFile] = useState<string>("");

	// Automatically select the template when the component mounts
	useEffect(() => {
		if (isContainerReady && selectedFramework) {
			handleTemplateSelect(selectedFramework);
		}
	}, [selectedFramework, isContainerReady]);

	// Load editing template data when available
	useEffect(() => {
		if (editingTemplate && isContainerReady) {
			setAnswerTemplate(editingTemplate.answerTemplate);
			selectTemplate(editingTemplate.answerTemplate);
		}
	}, [editingTemplate, isContainerReady, selectTemplate]);

	const handleNext = async () => {
		if (currentStep === "answer") {
			setIsLoading(true);
			try {
				const currentFiles = await getFileTree(".");
				if (currentFiles && selectedTemplate) {
					const cleanTemplate = extractSrcFromTemplate(
						currentFiles,
						selectedTemplate,
					);
					try {
						setAnswerTemplate(structuredClone(cleanTemplate));
					} catch (error) {
						setAnswerTemplate({ ...cleanTemplate });
					}
				}
				setCurrentStep("question");
			} catch (error) {
				console.error("Error during template transition:", error);
			} finally {
				setIsLoading(false);
			}
		}
	};

	const handleBack = async () => {
		if (currentStep === "question") {
			setIsLoading(true);
			try {
				setCurrentStep("answer");
				if (answerTemplate) {
					await selectTemplate(answerTemplate);
				}
			} catch (error) {
				console.error("Error during template transition:", error);
			} finally {
				setIsLoading(false);
			}
		}
	};

	const handleSave = async () => {
		setIsSaving(true);
		try {
			const currentQuestionTemplate = await getFileTree(".");
			if (answerTemplate && currentQuestionTemplate && selectedTemplate) {
				const cleanQuestionTemplate = extractSrcFromTemplate(
					currentQuestionTemplate,
					selectedTemplate,
				);

				// Create the saved template with the selected default file
				const savedTemplate = {
					framework: selectedFramework,
					questionTemplate: cleanQuestionTemplate,
					answerTemplate,
					defaultFile: selectedDefaultFile || selectedTemplate.defaultFile,
				};

				onSave(savedTemplate);
			}
		} catch (error) {
			console.error("Error saving templates:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const canProceed = (): boolean => {
		return !!(files && Object.keys(files).length > 0);
	};

	const canSave = (): boolean => {
		return !!(answerTemplate && files);
	};

	return (
		<div className="h-full flex flex-col justify-between relative">
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
									selectedTemplate={selectedTemplate}
									onDefaultFileChange={setSelectedDefaultFile}
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
				canProceed={canProceed()}
				canSave={canSave()}
				onNext={handleNext}
				onBack={handleBack}
				onSave={handleSave}
				answerTemplate={answerTemplate}
				files={files}
			/>
		</div>
	);
};

export default TemplateCreationInterface;
