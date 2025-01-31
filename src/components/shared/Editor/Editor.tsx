"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type EditorJS from "@editorjs/editorjs";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import useFileUpload from "@/hooks/useFileUpload";
import { UNAUTHENTICATED } from "@/utils/contants";
import LoginModal from "@/components/auth/LoginModal";
import Loader from "../Loader/Loader";
import { Path } from "react-hook-form";

interface EditorProps<T extends z.ZodType> {
	onSave: (data: z.infer<T>) => void;
	editorId?: string; // if multiple editor required in same page.
	validator: T;
	defaultValues: z.infer<T>;
	showTitleField?: boolean;
	showCommandDetail?: boolean;
	titlePlaceHolder?: string;
	contentPlaceHolder?: string;
}

export const Editor = <T extends z.ZodType>({
	onSave,
	editorId = "editor",
	validator,
	defaultValues = {},
	showTitleField = true,
	titlePlaceHolder = "Title",
	contentPlaceHolder = "Type here to write your post...",
	showCommandDetail,
}: EditorProps<T>) => {
	type FormData = z.infer<typeof validator>;
	const ref = useRef<EditorJS>(null);
	const _titleRef = useRef<HTMLTextAreaElement>(null);
	const [isMounted, setIsMounted] = useState<boolean>(false);
	const { uploadFile } = useFileUpload();
	const [uploadError, setUploadError] = useState<string | null | undefined>(
		null,
	);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(validator),
		defaultValues,
	});

	function createPost(payload: FormData) {
		console.log(payload);
	}

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
				data: { blocks: [] },
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
											postid: "pranavpost",
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
			});
		}
	}, [editorId]);

	useEffect(() => {
		if (Object.keys(errors).length) {
			for (const [_key, value] of Object.entries(errors)) {
				value;
				toast({
					title: "Something went wrong.",
					description: (value as { message: string }).message,
					variant: "destructive",
				});
			}
		}
	}, [errors]);

	useEffect(() => {
		if (typeof window !== "undefined") {
			setIsMounted(true);
		}
	}, []);

	useEffect(() => {
		const init = async () => {
			await initializeEditor();

			setTimeout(() => {
				_titleRef?.current?.focus();
			}, 0);
		};

		if (isMounted) {
			init();

			return () => {
				ref.current?.destroy();
				ref.current = null;
			};
		}
	}, [isMounted, initializeEditor]);

	async function onSubmit(data: FormData) {
		const blocks = await ref.current?.save();

		const payload: FormData = {
			title: data.title,
			content: blocks,
		};

		createPost(payload);
	}

	const titleRegister = showTitleField
		? register("title" as Path<FormData>)
		: null;

	return (
		<>
			{uploadError && uploadError === UNAUTHENTICATED && (
				<LoginModal
					closeHandler={() => setUploadError(null)}
					message="Sign in to upload an image."
				/>
			)}

			<div className="pt-8  min-w-[73%]">
				{!isMounted ? (
					<div className="flex items-center justify-center w-full h-full">
						<Loader />
					</div>
				) : (
					<form
						id="subreddit-post-form"
						className="w-full"
						onSubmit={handleSubmit(onSubmit)}
					>
						<div className="prose prose-stone dark:prose-invert flex flex-col gap-8 w-full">
							{showTitleField && (
								<TextareaAutosize
									ref={(e) => {
										titleRegister?.ref(e);
										_titleRef.current = e;
									}}
									{...titleRegister}
									placeholder={titlePlaceHolder}
									className="w-full overflow-hidden  text-3xl font-bold bg-transparent appearance-none resize-none focus:outline-none"
								/>
							)}
							<div id={editorId} />
							{showCommandDetail && (
								<p className="text-sm text-gray-500">
									Use{" "}
									<kbd className="px-1 text-xs uppercase border rounded-md bg-muted">
										Enter
									</kbd>{" "}
									to open the command menu.
								</p>
							)}
						</div>
					</form>
				)}
			</div>
			<style>
				{`
          .codex-editor__redactor {
            padding-bottom: 200px !important; 
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
