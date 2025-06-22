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

	// Automatically select the template when the component mounts
	useEffect(() => {
		if (isContainerReady && selectedFramework) {
			handleTemplateSelect(selectedFramework);
		}
	}, [selectedFramework, isContainerReady]);

	const handleNext = async () => {
		if (currentStep === "question") {
			// Get current file tree with user edits
			const currentFiles = await getFileTree(".");
			if (currentFiles) {
				setQuestionTemplate(currentFiles);
			}
			setCurrentStep("answer");
			// Reset files for answer template
			handleTemplateSelect(selectedFramework);
		}
	};

	const handleSave = async () => {
		// Get current file tree with user edits for answer template
		const currentAnswerTemplate = await getFileTree(".");

		if (questionTemplate && currentAnswerTemplate) {
			onSave({
				framework: selectedFramework,
				questionTemplate,
				answerTemplate: currentAnswerTemplate,
			});
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
		<div className="h-full flex flex-col">
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
			<Card className="mt-4">
				<CardContent className="flex justify-between items-center p-4">
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
					<div className="flex gap-2">
						{currentStep === "question" ? (
							<Button
								onClick={handleNext}
								disabled={!canProceed()}
								className="bg-blue-600 hover:bg-blue-700"
							>
								Next
							</Button>
						) : (
							<Button
								onClick={handleSave}
								disabled={!canSave()}
								className="bg-green-600 hover:bg-green-700"
							>
								Save Templates
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default TemplateCreationInterface;
