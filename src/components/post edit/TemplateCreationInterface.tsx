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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TemplateFramework } from "@prisma/client";
import { handleTemplateSelect } from "../playground/utils/templateUtils";
import type { FileSystemTree } from "../playground/lib/types";
import { Loader2 } from "lucide-react";

interface TemplateCreationInterfaceProps {
	selectedFramework: TemplateFramework;
	onSave: (templates: {
		framework: TemplateFramework;
		questionTemplate: FileSystemTree;
		answerTemplate: FileSystemTree;
	}) => void;
}

type TemplateStep = "question" | "answer";

const TemplateCreationInterface: FC<TemplateCreationInterfaceProps> = ({
	selectedFramework,
	onSave,
}) => {
	const { selectedTemplate, isContainerReady, files, getFileTree } =
		useWebContainerStore();
	const [currentStep, setCurrentStep] = useState<TemplateStep>("question");
	const [questionTemplate, setQuestionTemplate] =
		useState<FileSystemTree | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	// Automatically select the template when the component mounts
	useEffect(() => {
		if (isContainerReady && selectedFramework) {
			handleTemplateSelect(selectedFramework);
		}
	}, [selectedFramework, isContainerReady]);

	const handleNext = async () => {
		if (currentStep === "question") {
			setIsLoading(true);
			try {
				// Get current file tree with user edits
				const currentFiles = await getFileTree(".");
				if (currentFiles) {
					setQuestionTemplate(currentFiles);
				}
				setCurrentStep("answer");
				// Reset files for answer template
				await handleTemplateSelect(selectedFramework);
			} catch (error) {
				console.error("Error during template transition:", error);
			} finally {
				setIsLoading(false);
			}
		}
	};

	const handleBack = async () => {
		if (currentStep === "answer") {
			setIsLoading(true);
			try {
				// Save current answer template state if needed
				const currentAnswerTemplate = await getFileTree(".");
				if (currentAnswerTemplate) {
					// You could store this temporarily if you want to preserve answer template edits
				}
				setCurrentStep("question");
				// Restore question template files
				if (questionTemplate) {
					// Reset to the saved question template
					await handleTemplateSelect(selectedFramework);
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
			// Get current file tree with user edits for answer template
			const currentAnswerTemplate = await getFileTree(".");

			if (questionTemplate && currentAnswerTemplate) {
				onSave({
					framework: selectedFramework,
					questionTemplate,
					answerTemplate: currentAnswerTemplate,
				});
			}
		} catch (error) {
			console.error("Error saving templates:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const canProceed = () => {
		return files && Object.keys(files).length > 0;
	};

	const canSave = () => {
		return questionTemplate && files;
	};

	const getStepTitle = () => {
		return currentStep === "question" ? "Question Template" : "Answer Template";
	};

	const getStepDescription = () => {
		return currentStep === "question"
			? `Create the question template for ${selectedFramework.toLowerCase()} framework. This will be the starting point that users will see when they begin the challenge.`
			: `Create the answer template for ${selectedFramework.toLowerCase()} framework. This will be the solution that users can reference.`;
	};

	return (
		<div className="h-full flex flex-col justify-between relative">
			{(isLoading || isSaving) && (
				<div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
					<div className="flex flex-col items-center gap-4">
						<Loader2 className="h-16 w-16 animate-spin" />
						<p className="text-lg">
							{isSaving ? "Saving templates..." : "Loading template..."}
						</p>
					</div>
				</div>
			)}
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
							<div className="flex items-center gap-2 mb-4">
								<div className="flex items-center gap-2">
									<div
										className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
											currentStep === "question"
												? "bg-blue-500 text-white"
												: "bg-green-500 text-white"
										}`}
									>
										{currentStep === "question" ? "1" : "2"}
									</div>
									<h3 className="text-lg font-semibold">{getStepTitle()}</h3>
								</div>
							</div>
							<div className="flex-1 overflow-y-auto">
								<p className="text-sm text-muted-foreground">
									{getStepDescription()}
								</p>
								{/* Add more instruction content here */}
							</div>
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

			{/* Bottom Panel with Next/Save buttons */}
			<div className="flex justify-between items-center p-4 border-t-2">
				{/* Left side - Back button */}
				<div className="flex-1">
					{currentStep === "answer" && (
						<Button
							onClick={handleBack}
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
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<div
							className={`w-4 h-4 rounded-full ${
								questionTemplate ? "bg-green-500" : "bg-gray-300"
							}`}
						/>
						<span className="text-sm">Question Template</span>
					</div>
					<div className="flex items-center gap-2">
						<div
							className={`w-4 h-4 rounded-full ${
								currentStep === "answer" && files
									? "bg-green-500"
									: "bg-gray-300"
							}`}
						/>
						<span className="text-sm">Answer Template</span>
					</div>
				</div>

				{/* Right side - Next/Save button */}
				<div className="flex-1 flex justify-end">
					{currentStep === "question" ? (
						<Button
							onClick={handleNext}
							disabled={!canProceed() || isLoading}
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
						<Button
							onClick={handleSave}
							disabled={!canSave() || isSaving}
							className="bg-green-600 hover:bg-green-700"
						>
							{isSaving ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								"Save Templates"
							)}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
};

export default TemplateCreationInterface;
