"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type EditorJS from "@editorjs/editorjs";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import useFileUpload from "@/hooks/useFileUpload";
import { UNAUTHENTICATED } from "@/utils/contants";
import LoginModal from "@/components/auth/LoginModal";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import "./Editor.css";

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

interface EditorProps<T extends z.ZodType> {
	onChange: (data: z.infer<T>) => void;
	editorId?: string;
	defaultContent?: z.infer<T>;
	showTitleField?: boolean;
	showCommandDetail?: boolean;
	titlePlaceHolder?: string;
	contentPlaceHolder?: string;
	postId: string;
	dataLoading?: boolean;
}

export const Editor = <T extends z.ZodType>({
	onChange,
	editorId = "editor",
	defaultContent = {},
	showTitleField = true,
	titlePlaceHolder = "Title",
	contentPlaceHolder = "Type here to write your post...",
	showCommandDetail = true,
	postId,
	dataLoading = false,
}: EditorProps<T>) => {
	const ref = useRef<EditorJS>(null);
	const _titleRef = useRef<HTMLTextAreaElement>(null);
	const [isMounted, setIsMounted] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const { uploadFile } = useFileUpload();
	const [uploadError, setUploadError] = useState<string | null | undefined>(
		null,
	);

	// Preload modules on first render
	useEffect(() => {
		Promise.all(Object.values(editorModules)).then(() => {
			console.info("EditorJS modules preloaded");
		});
	}, []);

	const initializeEditor = useCallback(async () => {
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
				placeholder: contentPlaceHolder,
				inlineToolbar: true,
				data: defaultContent?.blocks
					? { blocks: defaultContent.blocks }
					: { blocks: [] },
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
										const { status, data } = await uploadFile(file, { postId });
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
					onChange({ title, ...content } as z.infer<T>);
				},
			});
		}
	}, [editorId]);

	useEffect(() => {
		setIsMounted(typeof window !== "undefined");
	}, []);

	useEffect(() => {
		if (!isMounted || dataLoading) return;

		const init = async () => {
			await initializeEditor();
			setIsLoading(false);
			setTimeout(() => _titleRef.current?.focus(), 0);
		};

		init();
		return () => {
			ref.current?.destroy();
			ref.current = null;
		};
	}, [isMounted, initializeEditor, dataLoading]);

	return (
		<>
			{uploadError === UNAUTHENTICATED && (
				<LoginModal
					closeHandler={() => setUploadError(null)}
					message="Sign in to upload an image."
				/>
			)}

			<div className="pt-8 min-w-[73%]">
				<div className="prose prose-stone dark:prose-invert flex flex-col gap-8 w-full h-full justify-between">
					<div className="h-full flex flex-col">
						{showTitleField &&
							(isLoading || dataLoading ? (
								<Skeleton className="h-10 w-52" />
							) : (
								<TextareaAutosize
									ref={_titleRef}
									defaultValue={defaultContent?.title ?? ""}
									placeholder={titlePlaceHolder}
									className="w-full overflow-hidden text-3xl font-bold bg-transparent appearance-none resize-none focus:outline-none"
								/>
							))}

						{!dataLoading && <div id={editorId} className="mt-6" />}

						{(isLoading || dataLoading) &&
							(dataLoading ? (
								<div className="h-full flex flex-col gap-2 mt-6">
									<Skeleton className={cn("ml-6 h-5 w-full ")} />
									<Skeleton className={cn("ml-6 h-5 w-[90%] ")} />
									<Skeleton className={cn("ml-6 h-5 w-full ")} />
									<Skeleton className={cn("ml-6 h-5 w-2/4 ")} />
									<Skeleton className={cn("ml-6 h-5 w-3/4 ")} />
									<Skeleton className={cn("ml-6 h-5 w-[90%] ")} />
									<Skeleton className={cn("ml-6 h-5 w-3/4 ")} />
									<Skeleton className={cn("ml-6 h-5 w-2/4 ")} />
									<Skeleton className={cn("ml-6 h-5 w-full ")} />
									<Skeleton className={cn("ml-6 h-5 w-3/4 ")} />
									<Skeleton className={cn("ml-6 h-5 w-[90%] ")} />
								</div>
							) : (
								<div className="h-full">
									<Skeleton className="ml-6 mt-4 h-5 w-64 mb-[200px]" />
								</div>
							))}
					</div>

					{showCommandDetail &&
						(isLoading || dataLoading ? (
							<Skeleton className="px-1 h-5 w-64" />
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
		</>
	);
};
