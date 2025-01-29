"use client";

import type EditorJS from "@editorjs/editorjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import type { z } from "zod";

import { toast } from "@/hooks/use-toast";
import { uploadFiles } from "@/lib/uploadthing";
import { type PostCreationRequest, PostValidator } from "@/lib/validators/post";
// import { useMutation } from '@tanstack/react-query'

import "./Editor.css";
import useFileUpload from "@/hooks/useFileUpload";
import { UNAUTHENTICATED } from "@/utils/contants";
import LoginModal from "@/components/auth/LoginModal";

type FormData = z.infer<typeof PostValidator>;

interface EditorProps {
	subredditId: string;
}

export const Editor: React.FC<EditorProps> = ({ subredditId }) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(PostValidator),
		defaultValues: {
			subredditId,
			title: "",
			content: null,
		},
	});
	const ref = useRef<EditorJS>(null);
	const _titleRef = useRef<HTMLTextAreaElement>(null);
	const router = useRouter();
	const [isMounted, setIsMounted] = useState<boolean>(false);
	const pathname = usePathname();
	const { uploadFile } = useFileUpload();
	const [uploadError, setUploadError] = useState<string | null | undefined>(
		null,
	);

	function createPost(payload: PostCreationRequest) {
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
				holder: "editor",
				onReady() {
					ref.current = editor;
				},
				placeholder: "Type here to write your post...",
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
										// Upload the file using the `uploadFiles` function
										const { status, data, ...rem } = await uploadFile(file, {
											postid: "pranavpost",
										});

										console.log("Uploaded file response:", status, data, rem);
										if (status === "error") {
											setUploadError(data.message);
											throw new Error(data.message);
										}

										// Return the format expected by Editor.js
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
	}, []);

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

		const payload: PostCreationRequest = {
			title: data.title,
			content: blocks,
			subredditId,
		};

		createPost(payload);
	}

	if (!isMounted) {
		return null;
	}

	const { ref: titleRef, ...rest } = register("title");

	return (
		<>
			{uploadError && uploadError === UNAUTHENTICATED && (
				<LoginModal
					closeHandler={() => setUploadError(null)}
					message="Sign in to upload an image."
				/>
			)}
			<div className="pt-8  min-w-[73%]">
				<form
					id="subreddit-post-form"
					className="w-fit"
					onSubmit={handleSubmit(onSubmit)}
				>
					<div className="prose prose-stone dark:prose-invert flex flex-col gap-8 w-full">
						<TextareaAutosize
							ref={(e) => {
								titleRef(e);
								// @ts-ignore
								_titleRef.current = e;
							}}
							{...rest}
							placeholder="Title"
							className="w-full overflow-hidden text-5xl font-bold bg-transparent appearance-none resize-none focus:outline-none"
						/>
						<div id="editor" className="min-h-[500px]" />
						<p className="text-sm text-gray-500">
							Use{" "}
							<kbd className="px-1 text-xs uppercase border rounded-md bg-muted">
								Tab
							</kbd>{" "}
							to open the command menu.
						</p>
					</div>
				</form>
			</div>
		</>
	);
};
