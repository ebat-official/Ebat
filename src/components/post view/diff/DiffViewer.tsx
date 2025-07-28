import React from "react";
import { PostWithExtraDetails } from "@/utils/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HtmlDiffClient from "./HtmlDiffClient";
import JsonDiffClient from "./JsonDiffClient";
import { ReactNode } from "react";

interface DiffViewerProps {
	originalPost: PostWithExtraDetails;
	modifiedPost: PostWithExtraDetails;
	componentRenderer: (post: PostWithExtraDetails) => ReactNode;
}

const DiffViewer: React.FC<DiffViewerProps> = ({
	originalPost,
	modifiedPost,
	componentRenderer,
}) => {
	return (
		<Tabs defaultValue="html" className="w-full">
			<TabsList className="grid w-full grid-cols-3 m-2">
				<TabsTrigger value="html">HTML Diff</TabsTrigger>
				<TabsTrigger value="bothViews">Both Views</TabsTrigger>
				<TabsTrigger value="json">JSON Diff</TabsTrigger>
			</TabsList>

			<TabsContent value="html">
				<HtmlDiffClient
					originalPost={originalPost}
					modifiedPost={modifiedPost}
					componentRenderer={componentRenderer}
				/>
			</TabsContent>

			<TabsContent value="bothViews">
				<div className="flex flex-col gap-6">
					<div>{componentRenderer(originalPost)}</div>

					<div>{componentRenderer(modifiedPost)}</div>
				</div>
			</TabsContent>

			<TabsContent value="json">
				<JsonDiffClient
					originalPost={originalPost}
					modifiedPost={modifiedPost}
				/>
			</TabsContent>
		</Tabs>
	);
};

export default React.memo(DiffViewer);
