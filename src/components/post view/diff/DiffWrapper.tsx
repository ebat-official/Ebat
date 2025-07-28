"use client";

import React from "react";
import { PostWithExtraDetails } from "@/utils/types";
import { ReactNode } from "react";
import DiffViewer from "./DiffViewer";
import DiffToggleButton from "./DiffToggleButton";

interface DiffWrapperProps {
	originalPost: PostWithExtraDetails;
	modifiedPost: PostWithExtraDetails;
	componentRenderer: (post: PostWithExtraDetails) => ReactNode;
	postId: string;
}

const DiffWrapper: React.FC<DiffWrapperProps> = ({
	originalPost,
	modifiedPost,
	componentRenderer,
	postId,
}) => {
	return (
		<article>
			<div className="flex justify-end mb-4">
				<DiffToggleButton postId={postId} />
			</div>
			<DiffViewer
				originalPost={originalPost}
				modifiedPost={modifiedPost}
				componentRenderer={componentRenderer}
			/>
		</article>
	);
};

export default DiffWrapper;
