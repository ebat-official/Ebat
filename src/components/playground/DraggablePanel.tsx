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
			{/* <Header /> */}
			<ResizablePanelGroup
				className="max-w-screen p-2"
				style={{ maxHeight: "calc(100vh - 66px)" }}
				direction="horizontal"
			>
				<ResizablePanel>
					<ChallengeQuestionView post={post} />
				</ResizablePanel>
				<ResizableHandle withHandle className="bg-transparent" />
				<ResizablePanel>
					<ResizablePanelGroup direction="vertical">
						<ResizablePanel className="flex-1">
							<EditorPanel />
						</ResizablePanel>
						<ResizableHandle withHandle className="bg-transparent" />
						<ResizablePanel defaultSize={30}>
							<OutputPanel />
						</ResizablePanel>
					</ResizablePanelGroup>
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
};

export default DraggablePanel;
