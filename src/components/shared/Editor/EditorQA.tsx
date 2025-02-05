"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type EditorJS from "@editorjs/editorjs";
import { OutputData } from "@editorjs/editorjs";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import useFileUpload from "@/hooks/useFileUpload";
import { UNAUTHENTICATED } from "@/utils/contants";
import LoginModal from "@/components/auth/LoginModal";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import PostContentSkeleton from "./PostContentSkelton";

// Define core editor content types
export interface EditorContent extends OutputData {
	title?: string;
}

export interface InitialBlocks {
	post?: EditorContent;
	answer?: EditorContent;
}

// Dynamic imports for EditorJS modules
const editorModules = {
	EditorJS: import("@editorjs/editorjs").then((mod) => mod.default),
	Header: import("@editorjs/header").then((mod) => mod.default),
	Embed: import("@editorjs/embed").then((mod) => mod.default),
	Table: import("@editorjs/table").then((mod) => mod.default),
	List: import("@editorjs/list").then((mod) => mod.default),
	Code: import("@editorjs/code").then((mod) => mod.default),
	LinkTool: import("@editorjs/link").then((mod) => mod.default),
	InlineCode: import("@editorjs/inline-code").then((mod) => mod.default),
	ImageTool: import("@editorjs/image").then((mod) => mod.default),
};

interface EditorProps<T extends z.ZodType<EditorContent>> {
	onChange: (data: z.infer<T>) => void;
	answerHandler?: (data: z.infer<T>) => void;
	editorId?: string;
	defaultContent?: InitialBlocks;
	showTitleField?: boolean;
	showCommandDetail?: boolean;
	titlePlaceHolder?: string;
	contentPlaceHolder?: string;
	postId: string;
	dataLoading?: boolean;
	answerPlaceHolder?: string;
}

export const Editor = <T extends z.ZodType<EditorContent>>({
	onChange,
	defaultContent = {},
	showTitleField = true,
	titlePlaceHolder = "Title",
	contentPlaceHolder = "Type here to write your post...",
	showCommandDetail = true,
	postId,
	dataLoading = false,
	answerHandler,
	answerPlaceHolder = "",
}: EditorProps<T>) => {
	const ref = useRef<EditorJS>(null);
	const _titleRef = useRef<HTMLTextAreaElement>(null);
	const [isMounted, setIsMounted] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const { uploadFile } = useFileUpload();
	const [uploadError, setUploadError] = useState<string | null | undefined>(
		null,
	);

	const editorPostId = `editor-post-${postId}`;
	const editorAnswerId = answerHandler ? `editor-answer-${postId}` : null;

	useEffect(() => {
		setIsMounted(typeof window !== "undefined");
		Promise.all(Object.values(editorModules)).then(() => {
			console.info("EditorJS modules preloaded");
		});
	}, []);

	const initializeEditor = useCallback(
		async (
			editorId: string,
			placeholder: string,
			onChangeHandler: (data: EditorContent) => void,
			initialBlocks?: EditorContent["blocks"],
		) => {
			const [
				EditorJSModule,
				HeaderModule,
				EmbedModule,
				TableModule,
				ListModule,
				CodeModule,
				LinkToolModule,
				InlineCodeModule,
				ImageToolModule,
			] = await Promise.all(Object.values(editorModules));

			if (!ref.current) {
				const editor = new EditorJSModule({
					holder: editorId,
					onReady() {
						ref.current = editor;
					},
					placeholder,
					inlineToolbar: true,
					data: initialBlocks ? { blocks: initialBlocks } : { blocks: [] },
					tools: {
						header: HeaderModule,
						linkTool: {
							class: LinkToolModule,
							config: { endpoint: "/api/link" },
						},
						image: {
							class: ImageToolModule,
							config: {
								features: { caption: "optional" },
								uploader: {
									async uploadByFile(file: File) {
										try {
											const { status, data } = await uploadFile(file, {
												postId,
											});
											if (status === "error") {
												setUploadError(data.message);
												throw new Error(data.message);
											}
											return { success: 1, file: { url: data.url } };
										} catch (error) {
											console.error("Image upload failed:", error);
											return { success: 0, error: "Failed to upload image" };
										}
									},
								},
							},
						},
						list: ListModule,
						code: CodeModule,
						inlineCode: InlineCodeModule,
						table: TableModule,
						embed: EmbedModule,
					},
					async onChange() {
						const content = await editor.save();
						const title = _titleRef.current?.value || "";
						onChangeHandler({ title, blocks: content.blocks });
					},
				});
			}
		},
		[postId],
	);

	// Initialize all editors when mounted and data is ready
	useEffect(() => {
		if (!isMounted || dataLoading) return;

		const init = async () => {
			const editors = [
				initializeEditor(
					editorPostId,
					contentPlaceHolder,
					onChange,
					defaultContent.post?.blocks,
				),
			];

			if (editorAnswerId && answerHandler) {
				editors.push(
					initializeEditor(
						editorAnswerId,
						answerPlaceHolder,
						answerHandler,
						defaultContent.answer?.blocks,
					),
				);
			}

			await Promise.all(editors);
			setIsLoading(false);
			setTimeout(() => _titleRef.current?.focus(), 0);
		};

		init();
		return () => {
			ref.current?.destroy();
			ref.current = null;
		};
	}, [isMounted, dataLoading, initializeEditor]);

	return (
		<>
			{uploadError === UNAUTHENTICATED && (
				<LoginModal
					closeHandler={() => setUploadError(null)}
					message="Sign in to upload an image."
				/>
			)}

			<div className="pt-8 min-w-[73%]">
				<div className="prose prose-stone dark:prose-invert flex flex-col w-full h-full justify-between ">
					<div className="h-full flex flex-col">
						{showTitleField &&
							(isLoading || dataLoading ? (
								<Skeleton className="h-10 w-52" />
							) : (
								<TextareaAutosize
									ref={_titleRef}
									defaultValue={defaultContent?.post?.title ?? ""}
									placeholder={titlePlaceHolder}
									className={cn(
										"w-full overflow-hidden text-3xl font-bold bg-transparent appearance-none resize-none focus:outline-none",
									)}
								/>
							))}

						{!dataLoading && <div id={editorPostId} className="mt-6" />}

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
							<Separator className="py-0.5" />

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

							{!dataLoading && <div id={editorAnswerId} className="mt-6" />}
						</>
					)}

					{showCommandDetail &&
						(isLoading || dataLoading ? (
							<Skeleton className="px-1 h-6 w-64" />
						) : (
							<p className="text-sm text-gray-500">
								Use{" "}
								<kbd className="px-1 text-xs uppercase border rounded-md bg-muted">
									Enter
								</kbd>{" "}
								to open the command menu.
							</p>
						))}
				</div>
			</div>

			<style jsx global>{`
            .codex-editor__redactor {
                padding-bottom: 250px !important;
                min-height: 200px;
            }
        .codex-editor [data-placeholder-active]:empty:before,
        .codex-editor [data-placeholder-active][data-empty="true"]:before {
            color: hsl(var(--color-text-primary)) !important;
            background-color: hsl(var(--background)) !important;
            opacity: 50%;
            }
`}</style>
		</>
	);
};
