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

interface DraggablePanelProps {
	post: PostWithExtraDetails;
}

const DraggablePanel: FC<DraggablePanelProps> = ({ post }) => {
	return (
		<div>
			<Header />
			<ResizablePanelGroup
				className="max-w-screen max-h-screen"
				direction="horizontal"
			>
				<ResizablePanel>
					<ChallengeQuestionView post={post} />
				</ResizablePanel>
				<ResizableHandle />
				<ResizablePanel>
					<ResizablePanelGroup direction="vertical">
						<ResizablePanel>
							<EditorPanel />
						</ResizablePanel>
						<ResizableHandle />
						<ResizablePanel defaultSize={75}>
							<OutputPanel />
						</ResizablePanel>
					</ResizablePanelGroup>
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
};

export default DraggablePanel;
