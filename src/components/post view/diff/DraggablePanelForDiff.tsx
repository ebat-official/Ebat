import { PostWithExtraDetails } from "@/utils/types";
import React, { FC } from "react";
import DraggablePanel from "../../playground/DraggablePanel";

type DraggablePanelForDiffProps = {
	post: PostWithExtraDetails;
};

const DraggablePanelForDiff: FC<DraggablePanelForDiffProps> = ({ post }) => {
	// Don't record post view for diff comparison to avoid hydration mismatches
	return <DraggablePanel post={post} />;
};

export default DraggablePanelForDiff;
