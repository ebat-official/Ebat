"use client";

import React, { ReactNode } from "react";
import { PostWithExtraDetails } from "@/utils/types";
import DiffWrapper from "./DiffWrapper";
import DiffToggleButton from "./DiffToggleButton";
import PostViewForDiff from "../PostViewForDiff";
import DraggablePanelForDiff from "./DraggablePanelForDiff";

interface UnifiedPreviewProps {
	post: PostWithExtraDetails;
	originalPost?: PostWithExtraDetails | null;
	postId: string;
	isEdited: boolean;
	showDiff: boolean;
	componentSlot: ReactNode;
	componentType: "post" | "challenge";
}

const UnifiedPreview: React.FC<UnifiedPreviewProps> = ({
	post,
	originalPost,
	postId,
	isEdited,
	showDiff,
	componentSlot,
	componentType,
}) => {
	// Show diff view if requested and we have both original and modified posts
	if (showDiff && isEdited && originalPost) {
		// Use the componentType to determine which diff component to use
		const componentRenderer =
			componentType === "challenge"
				? (post: PostWithExtraDetails): ReactNode => (
						<DraggablePanelForDiff post={post} />
					)
				: (post: PostWithExtraDetails): ReactNode => (
						<PostViewForDiff post={post} />
					);

		return (
			<DiffWrapper
				originalPost={originalPost}
				modifiedPost={post}
				componentRenderer={componentRenderer}
				postId={postId}
			/>
		);
	}

	return (
		<article>
			{isEdited && (
				<div className="flex justify-end mb-4">
					<DiffToggleButton postId={postId} />
				</div>
			)}
			{componentSlot}
		</article>
	);
};

export default UnifiedPreview;
