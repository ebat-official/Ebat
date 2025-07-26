"use client";
import { Card } from "@/components/ui/card";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { recordPostView } from "@/lib/viewTracker";
import { ChallengeTemplate, PostWithExtraDetails } from "@/utils/types";
import { useParams } from "next/navigation";
import React, { FC, useEffect } from "react";
import { OnlineIDE } from "./components/OnlineIde";
import { BottomPanel } from "./components/ide/BottomPanel";
import { PreviewPanel } from "./components/preview/PreviewPanel";
import { useWebContainerStore } from "./store/webContainer";
import { TemplateStorage } from "./utils/templateStorage";

interface PlaygroundIDEProps {
	post: PostWithExtraDetails;
}

const PlaygroundIDE: FC<PlaygroundIDEProps> = ({ post }) => {
	const { subCategory: subCategoryRoute } = useParams();
	const TemplateIdFromUrl = (
		Array.isArray(subCategoryRoute) ? subCategoryRoute[0] : subCategoryRoute
	)?.toLowerCase();

	const { selectedTemplate, selectTemplate, setPost } = useWebContainerStore();

	recordPostView(post.id);

	// Set post in store when component mounts
	useEffect(() => {
		setPost(post);
	}, [post, setPost]);

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

	return (
		<Card className="h-full w-full py-0 bg-gray-100 dark:bg-[#181825]">
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
							<OnlineIDE />
						</ResizablePanel>
						{selectedTemplate && selectedTemplate.hasPreview !== false && (
							<>
								<ResizableHandle
									withHandle
									className="hidden md:flex bg-transparent"
								/>
								<ResizablePanel
									className="!basis-auto md:!basis-0"
									defaultSize={40}
								>
									<PreviewPanel selectedTemplate={selectedTemplate} />
								</ResizablePanel>
							</>
						)}
					</ResizablePanelGroup>
				</ResizablePanel>
				<ResizableHandle withHandle className="hidden md:flex bg-transparent" />
				<ResizablePanel defaultSize={30} className="!basis-auto md:!basis-0">
					<BottomPanel />
				</ResizablePanel>
			</ResizablePanelGroup>
		</Card>
	);
};

export default PlaygroundIDE;
