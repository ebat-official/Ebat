"use client";

import LoginModal from "@/components/auth/LoginModal";
import PostContentSkeleton from "@/components/post edit/PostContentSkelton";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UNAUTHENTICATED } from "@/utils/constants";
import { ContentType, EditorContent } from "@/utils/types";
import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";
import { RiQuestionAnswerLine } from "react-icons/ri";
import { z } from "zod";
import { useEditorStore } from "@/store/useEditorStore";

// Dynamically import the Lexical Editor with SSR disabled
const Editor = dynamic(() => import("@/components/shared/Lexical Editor"), {
	ssr: false, // Disable server-side rendering for this component
});

interface EditorProps<T extends z.ZodType<EditorContent>> {
	defaultContent?: ContentType;
	postId: string;
	dataLoading?: boolean;
}

export const LexicalViewer = <T extends z.ZodType<EditorContent>>({
	defaultContent = {},
	postId,
	dataLoading = false,
}: EditorProps<T>) => {
	const { setMinHeight } = useEditorStore();
	const [isMounted, setIsMounted] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [uploadError, setUploadError] = useState<string | null | undefined>(
		null,
	);
	setMinHeight("0px");
	const editorPostId = `editor-post-${postId}`;
	const editorAnswerId = defaultContent.answer
		? `editor-answer-${postId}`
		: null;
	const _titleRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		setIsMounted(true); // Set isMounted to true when the component mounts on the client
	}, []);

	// Initialize all editors when mounted and data is ready
	useEffect(() => {
		if (!isMounted || dataLoading) return;

		setIsLoading(false);
		setTimeout(() => _titleRef.current?.focus(), 0);
	}, [isMounted, dataLoading]);

	return (
		<>
			{uploadError === UNAUTHENTICATED && (
				<LoginModal
					closeHandler={() => setUploadError(null)}
					message="Sign in to upload an image."
				/>
			)}

			<div className="pt-8 min-w-[73%]">
				<div className="prose prose-stone dark:prose-invert flex flex-col w-full h-full gap-2  ">
					<div className=" flex flex-col">
						{!dataLoading &&
							isMounted && ( // Render Lexical Editor only on the client
								<div id={editorPostId}>
									<Editor
										isEditable={false}
										content={defaultContent.post?.blocks} // Pass initial content
										id={editorPostId}
									/>
								</div>
							)}

						{(isLoading || dataLoading) &&
							(dataLoading ? (
								<PostContentSkeleton
									lines={10}
									className="mt-6 mb-6 min-h-[250px]"
								/>
							) : (
								<Skeleton className="ml-6 mt-6 h-5 w-64 mb-[240px]" />
							))}
					</div>

					{editorAnswerId && (
						<>
							{isLoading || dataLoading ? (
								dataLoading ? (
									<PostContentSkeleton
										lines={9}
										className="mt-8 min-h-[250px] mb-4"
									/>
								) : (
									<Skeleton className="ml-6 mt-6 h-5 w-64 mb-[240px]" />
								)
							) : null}

							{!dataLoading && isMounted && (
								<div
									className={
										"bg-foreground/5 text-card-foreground flex flex-col rounded-xl border p-2 shadow-sm  min-h-[300px]"
									}
								>
									<div className="flex gap-2 items-center pt-4 pl-4 text-md font-bold text-green-500 ">
										<RiQuestionAnswerLine />
										<span>Answer</span>
									</div>

									<Editor
										isEditable={false}
										content={defaultContent.answer?.blocks}
										id={editorAnswerId}
									/>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</>
	);
};
