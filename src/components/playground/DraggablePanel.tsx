"use client";
import React, { FC, useEffect } from "react";
import { PostWithExtraDetails } from "@/utils/types";
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

interface DraggablePanelProps {
	post: PostWithExtraDetails;
}

const DraggablePanel: FC<DraggablePanelProps> = ({ post }) => {
	const { selectedTemplate, setPost } = useWebContainerStore();

	// Set the post in the store when component mounts or post changes
	useEffect(() => {
		setPost(post);
	}, [post]);

	return (
		<div>
			{/* <Header /> */}
			<ResizablePanelGroup
				className="max-w-screen p-2 !flex-col md:!flex-row"
				direction="horizontal"
			>
				<ResizablePanel
					defaultSize={40}
					className="!basis-auto md:!basis-0 md:max-h-[calc(100vh-80px)]"
				>
					<ChallengeQuestionView post={post} />
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
		</div>
	);
};

export default DraggablePanel;
