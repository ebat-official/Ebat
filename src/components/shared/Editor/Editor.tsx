"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type EditorJS from "@editorjs/editorjs";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import useFileUpload from "@/hooks/useFileUpload";
import { UNAUTHENTICATED } from "@/utils/contants";
import LoginModal from "@/components/auth/LoginModal";
import { Path } from "react-hook-form";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface EditorProps<T extends z.ZodType> {
	onChange: (data: z.infer<T>) => void;
	editorId?: string; // if multiple editor required in same page.
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
	const [isMounted, setIsMounted] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState(true);
	const { uploadFile } = useFileUpload();
	const [uploadError, setUploadError] = useState<string | null | undefined>(
		null,
	);

	const initializeEditor = useCallback(async () => {
		const EditorJS = (await import("@editorjs/editorjs")).default;
		const Header = (await import("@editorjs/header")).default;
		const Embed = (await import("@editorjs/embed")).default;
		const Table = (await import("@editorjs/table")).default;
		const List = (await import("@editorjs/list")).default;
		const Code = (await import("@editorjs/code")).default;
		const LinkTool = (await import("@editorjs/link")).default;
		const InlineCode = (await import("@editorjs/inline-code")).default;
		const ImageTool = (await import("@editorjs/image")).default;

		if (!ref.current) {
			const editor = new EditorJS({
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
					header: Header,
					linkTool: {
						class: LinkTool,
						config: {
							endpoint: "/api/link",
						},
					},
					image: {
						class: ImageTool,
						config: {
							features: {
								caption: "optional",
							},
							uploader: {
								async uploadByFile(file: File) {
									try {
										const { status, data, ...rem } = await uploadFile(file, {
											postId,
										});

										console.log("Uploaded file response:", status, data, rem);
										if (status === "error") {
											setUploadError(data.message);
											throw new Error(data.message);
										}

										return {
											success: 1,
											file: {
												url: data.url,
											},
										};
									} catch (error) {
										console.error("Image upload failed:", error);
										return {
											success: 0,
											error: "Failed to upload the image. Please try again.",
										};
									}
								},
							},
						},
					},
					list: List,
					code: Code,
					inlineCode: InlineCode,
					table: Table,
					embed: Embed,
				},
				onChange: async () => {
					const content = await editor.save();
					console.log("datuu", content);
					const title = _titleRef.current?.value || "";
					onChange({ title, ...content } as z.infer<T>);
				},
			});
		}
	}, [editorId]);

	useEffect(() => {
		if (typeof window !== "undefined") {
			setIsMounted(true);
		}
	}, []);

	useEffect(() => {
		const init = async () => {
			await initializeEditor();
			setIsLoading(false);
			setTimeout(() => {
				_titleRef?.current?.focus();
			}, 0);
		};

		//If data is fetching, it shoyld wait before, init,
		//bcz: once it initialized, data cant change
		if (isMounted && !dataLoading) {
			init();

			return () => {
				ref.current?.destroy();
				ref.current = null;
			};
		}
	}, [isMounted, initializeEditor, dataLoading]);

	return (
		<>
			{uploadError && uploadError === UNAUTHENTICATED && (
				<LoginModal
					closeHandler={() => setUploadError(null)}
					message="Sign in to upload an image."
				/>
			)}

			<div className="pt-8  min-w-[73%]">
				<div className="prose prose-stone dark:prose-invert flex flex-col gap-8 w-full h-full justify-between">
					<div className="h-full flex flex-col">
						{showTitleField &&
							(isLoading || dataLoading ? (
								<Skeleton className="h-10 w-52" />
							) : (
								<TextareaAutosize
									ref={(e) => {
										_titleRef.current = e;
									}}
									defaultValue={defaultContent?.title ?? ""}
									placeholder={titlePlaceHolder}
									className="w-full overflow-hidden  text-3xl font-bold bg-transparent appearance-none resize-none focus:outline-none"
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
									<Skeleton className={cn("ml-6 mt-4 h-5 w-64 mb-[200px]")} />
								</div>
							))}
					</div>
					{showCommandDetail &&
						(isLoading || dataLoading ? (
							<Skeleton className="px-1 h-5 w-64 " />
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
			<style>
				{`
          .codex-editor__redactor {
            padding-bottom: 200px !important;
			min-height:200px;
          }

		  .codex-editor [data-placeholder-active]:empty:before, .codex-editor [data-placeholder-active][data-empty=true]:before {
		   color: hsl(var(--color-text-primary)) !important;
		   background-color: hsl(var(--background)) !important;
		   opacity:50%;
		   }

        `}
			</style>
		</>
	);
};
