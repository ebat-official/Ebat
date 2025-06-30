"use client";
import React, { FC, useEffect, useState } from "react";
import { PostWithExtraDetails, ChallengeTemplate } from "@/utils/types";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import ChallengeQuestionView from "./ChallengeQuestionView";
import { OnlineIDE } from "./components/OnlineIde";
import { BottomPanel } from "./components/ide/BottomPanel";
import { PreviewPanel } from "./components/preview/PreviewPanel";
import { useWebContainerStore } from "./store/webContainer";
import { Card } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { TemplateStorage } from "./utils/templateStorage";
import { ChallengeStartModal } from "./components/ChallengeStartModal";
import { useSidebar } from "@/context/SidebarContext";

interface DraggablePanelProps {
	post: PostWithExtraDetails;
}

const DraggablePanel: FC<DraggablePanelProps> = ({ post }) => {
	const { subCategory: subCategoryRoute } = useParams();
	const TemplateIdFromUrl = (
		Array.isArray(subCategoryRoute) ? subCategoryRoute[0] : subCategoryRoute
	)?.toUpperCase();

	const { selectedTemplate, selectTemplate, setPost } = useWebContainerStore();
	const { setMobileNav } = useSidebar();

	// Simple state to show/hide the coding interface
	const [showCodingInterface, setShowCodingInterface] = useState(false);

	// Set post in store when component mounts
	useEffect(() => {
		setPost(post);
	}, [post, setPost]);

	// Set mobile navigation state
	useEffect(() => {
		setMobileNav(true);
		return () => {
			setMobileNav(false);
		};
	}, [setMobileNav]);

	// Handle template selection from post.challengeTemplates
	useEffect(() => {
		// Only run if container is ready and no template is currently selected
		if (post.challengeTemplates && post.challengeTemplates.length > 0) {
			// Find template that matches TemplateIdFromUrl
			let templateToLoad = post.challengeTemplates.find(
				(template: ChallengeTemplate) =>
					template.framework === TemplateIdFromUrl,
			);

			// If no match found, use the first template
			if (!templateToLoad) {
				templateToLoad = post.challengeTemplates[0];
			}

			// Check if saved template exists first
			if (templateToLoad.questionTemplate) {
				const originalTemplate = templateToLoad.questionTemplate;
				const templateId = originalTemplate.id;

				// Try to load saved template first
				const savedTemplate = TemplateStorage.loadTemplate(post.id, templateId);

				if (savedTemplate) {
					// Properly merge saved files into src directory
					const template = {
						...originalTemplate, // Keep all original properties
						files: {
							...originalTemplate.files, // Keep root files (package.json, etc.)
							src: {
								directory: savedTemplate.srcFiles, // Replace src directory with saved files
							},
						},
					};

					selectTemplate(template);
				} else {
					// Load original template
					selectTemplate(originalTemplate);
				}
			}
		}
	}, [post.challengeTemplates, TemplateIdFromUrl, post.id, selectTemplate]);

	// Handle start challenge click
	const handleStartChallenge = () => {
		setShowCodingInterface(true);
	};

	return (
		<div>
			{/* <Header /> */}
			<ResizablePanelGroup
				className="max-w-screen p-2 !flex-col md:!flex-row"
				direction="horizontal"
			>
				<ResizablePanel
					defaultSize={50}
					className="!basis-auto md:!basis-0 md:h-[calc(100vh-80px)]"
				>
					<ChallengeQuestionView post={post} />
				</ResizablePanel>
				<ResizableHandle withHandle className="hidden md:flex bg-transparent" />
				<ResizablePanel defaultSize={50} className="!basis-auto md:!basis-0">
					<Card className="h-full w-full py-0">
						<ResizablePanelGroup direction="vertical" className="!flex-col">
							<ResizablePanel
								className="flex-1 !basis-auto md:!basis-0"
								defaultSize={70}
							>
								<ResizablePanelGroup
									direction="horizontal"
									className="!flex-col md:!flex-row"
								>
									<ResizablePanel
										defaultSize={60}
										className="!basis-auto md:!basis-0 rounded-t-xl"
									>
										{!showCodingInterface ? (
											<ChallengeStartModal onStart={handleStartChallenge} />
										) : (
											<OnlineIDE />
										)}
									</ResizablePanel>
									{selectedTemplate &&
										selectedTemplate.hasPreview !== false &&
										showCodingInterface && (
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
		</div>
	);
};

export default DraggablePanel;
