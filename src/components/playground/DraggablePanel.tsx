import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { PostWithExtraDetails } from "@/utils/types";
import React, { FC } from "react";
import ChallengeQuestionView from "./ChallengeQuestionView";
import PlaygroundIDE from "./PlaygroundIDE";

interface DraggablePanelProps {
	post: PostWithExtraDetails;
}

const DraggablePanel: FC<DraggablePanelProps> = ({ post }) => {
	return (
		<div>
			{/* <Header /> */}
			<ResizablePanelGroup
				className="max-w-screen p-2 !flex-col md:!flex-row "
				direction="horizontal"
			>
				<ResizablePanel
					defaultSize={40}
					className="!basis-auto md:!basis-0 md:h-[calc(100vh-80px)]"
				>
					<ChallengeQuestionView post={post} />
				</ResizablePanel>
				<ResizableHandle withHandle className="hidden md:flex bg-transparent" />
				<ResizablePanel defaultSize={60} className="!basis-auto md:!basis-0 ">
					<PlaygroundIDE post={post} />
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
};

export default DraggablePanel;
