import { Editor } from "@/components/shared/Editor/Editor";
import RightPanelLayout from "@/components/shared/RightPanelLayout";
import React from "react";

function page() {
	return (
		<RightPanelLayout>
			<RightPanelLayout.MainPanel>
				<Editor subredditId={"9786543567890"} />
			</RightPanelLayout.MainPanel>
			<RightPanelLayout.SidePanel>
				<div className="h-9" />
			</RightPanelLayout.SidePanel>
		</RightPanelLayout>
	);
}

export default page;
