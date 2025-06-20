"use client";
import React, { FC } from "react";
import { PostWithExtraDetails } from "@/utils/types";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import Header from "./Header";
import EditorPanel from "./EditorPanel";
import OutputPanel from "./OutputPanel";
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
	const { selectedTemplate } = useWebContainerStore();

	return (
		<div>
			{/* <Header /> */}
			<ResizablePanelGroup
				className="max-w-screen p-2"
				style={{ maxHeight: "calc(100vh - 66px)" }}
				direction="horizontal"
			>
				<ResizablePanel defaultSize={40}>
					<ChallengeQuestionView post={post} />
				</ResizablePanel>
				<ResizableHandle withHandle className="bg-transparent" />
				<ResizablePanel>
					<Card className="h-full w-full py-0">
						<ResizablePanelGroup direction="vertical">
							<ResizablePanel className="flex-1">
								<ResizablePanelGroup direction="horizontal">
									<ResizablePanel defaultSize={60}>
										<OnlineIDE />
									</ResizablePanel>
									{selectedTemplate &&
										selectedTemplate.hasPreview !== false && (
											<>
												<ResizableHandle
													withHandle
													className="bg-transparent"
												/>
												<ResizablePanel>
													<PreviewPanel selectedTemplate={selectedTemplate} />
												</ResizablePanel>
											</>
										)}
								</ResizablePanelGroup>
							</ResizablePanel>
							<ResizableHandle withHandle className="bg-transparent" />
							<ResizablePanel defaultSize={30}>
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
