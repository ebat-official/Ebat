import { PostWithExtraDetails } from "@/utils/types";
import React, { FC } from "react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ContentReturnType } from "@/utils/types";
import { ContentRenderer } from "../ContentRenderer";
import { QuestionAnswerRender } from "../QuestionAnswerRender";
import { PostStatsBadge } from "../PostStatsBadge";
import { EditorProvider } from "../../shared/Lexical Editor/providers/EditorContext";
import RightPanelLayout from "../../shared/RightPanelLayout";

type DraggablePanelForDiffProps = {
	post: PostWithExtraDetails;
};

const DraggablePanelForDiff: FC<DraggablePanelForDiffProps> = ({ post }) => {
	// Don't record post view for diff comparison to avoid hydration mismatches
	const content = post.content as ContentReturnType;

	return (
		<EditorProvider>
			<RightPanelLayout className="mt-8 min-h-[75vh]">
				<RightPanelLayout.MainPanel className="flex flex-col gap-2">
					<Card className="relative items-center">
						<CardContent className="flex flex-col h-full px-4 md:px-8 w-full gap-2 max-w-3xl">
							<div className="flex gap-6 -ml-12">
								<div className="flex flex-col justify-center">
									<h1 className="opacity-90 w-full overflow-hidden text-lg md:text-2xl lg:text-3xl font-bold bg-transparent appearance-none resize-none focus:outline-none leading-relaxed">
										{post.title}
									</h1>
									<PostStatsBadge post={post} />
								</div>
							</div>
							<Separator />
							<ContentRenderer html={content.post} />
							<QuestionAnswerRender answer={content.answer} />
						</CardContent>
						<CardContent className="w-full px-4 md:px-8 max-w-4xl gap-8 flex flex-col">
							<Separator className="my-6" />
							<div className="md:hidden">
								{/* Static representation for diff - no interactive components */}
								<div className="p-4 rounded-lg border border-border bg-muted">
									<h3 className="font-semibold mb-2">Challenge Details</h3>
									<p className="text-sm text-muted-foreground">
										Interactive IDE components are not shown in diff view
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</RightPanelLayout.MainPanel>
				<RightPanelLayout.SidePanel className="sticky">
					<div className="hidden md:block">
						{/* Static representation for diff - no interactive components */}
						<div className="p-4 rounded-lg border border-border bg-muted">
							<h3 className="font-semibold mb-2">Challenge Details</h3>
							<p className="text-sm text-muted-foreground">
								Interactive IDE components are not shown in diff view
							</p>
						</div>
					</div>
				</RightPanelLayout.SidePanel>
			</RightPanelLayout>
		</EditorProvider>
	);
};

export default DraggablePanelForDiff;
