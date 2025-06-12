"use client";
import React, { useEffect, useState } from "react";
import { LexicalEditorWrapper } from "./Editor";
import { Card, CardContent } from "@/components/ui/card";
import { getLocalStorage, setLocalStorage } from "@/lib/localStorage";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { CiSaveDown2 } from "react-icons/ci";
import { MdOutlinePublish } from "react-icons/md";
import { ContentType, EditorContent, PostActions } from "@/utils/types";
import { Loader2 } from "lucide-react";
import { PostType } from "@prisma/client";
import { emptyEditorState } from "../shared/Lexical Editor/constants";
import { POST_ACTIONS } from "@/utils/contants";
import { useEditorContext } from "../shared/Lexical Editor/providers/EditorContext";
import { ThumbnailUpload } from "./ThumbnailUpload";

interface EditorContainerProps {
	postId: string;
	postType: PostType;
	defaultContent?: ContentType;
	dataLoading?: boolean;
	saveHandler: (data: ContentType) => void;
	publishHandler: (data: ContentType) => void;
	actionDraftLoading?: boolean;
	actionPublishLoading?: boolean;
	action?: PostActions;
}

function EditorContainer({
	postId,
	postType,
	defaultContent,
	dataLoading,
	saveHandler,
	publishHandler,
	actionDraftLoading,
	actionPublishLoading,
	action = POST_ACTIONS.CREATE,
}: EditorContainerProps) {
	const [content, setContent] = useState<ContentType>({});
	const [thumbnail, setThumbnail] = useState<string | undefined>();
	const [showThumbnailUpload, setShowThumbnailUpload] = useState(false);
	const localStorageKey = `editor-${action}_${postId}`;
	const savedData = getLocalStorage<ContentType>(localStorageKey);
	const { getImageUrls } = useEditorContext();

	const updateContent = (newContent: Partial<ContentType>) => {
		setContent((prev) => {
			const updated = { ...prev, ...newContent };
			setLocalStorage(localStorageKey, updated);
			return updated;
		});
	};

	// Initialize state from defaultContent or localStorage
	useEffect(() => {
		const initialData = savedData || defaultContent || {};
		const content: ContentType = {};
		content.post = initialData.post || { blocks: emptyEditorState };
		if (postType === PostType.QUESTION)
			content.answer = initialData.answer || { blocks: emptyEditorState };
		setContent(content);
		setThumbnail(initialData.thumbnail);
	}, [defaultContent, savedData]);

	const getTitlePlaceHolder = () => {
		switch (postType) {
			case PostType.QUESTION:
				return "Question";
			case PostType.BLOGS:
			case PostType.SYSTEMDESIGN:
				return "Title";
			default:
				return "Title";
		}
	};

	const getContentPlaceHolder = () => {
		switch (postType) {
			case PostType.QUESTION:
				return "Add more info to clarify (optional)...";
			case PostType.BLOGS:
				return "Type your blog here...";
			case PostType.SYSTEMDESIGN:
				return "Design your system here...";
			default:
				return "Type your content here...";
		}
	};

	const getPayload = () => {
		const thumbnailsArr = getImageUrls();
		return { ...content, thumbnail: thumbnail || thumbnailsArr[0] };
	};

	// Handler to receive selected thumbnail from ThumbnailUpload
	const handleInsertMedia = (file: { url: string; alt: string }) => {
		const payload = getPayload();
		publishHandler({ ...payload, thumbnail: file.url || payload.thumbnail });
		setShowThumbnailUpload(false);
	};

	const handlePublish = () => {
		const payload = getPayload();
		// If thumbnail is required and not set, show the thumbnail upload
		if (postType === PostType.BLOGS || postType === PostType.SYSTEMDESIGN) {
			setShowThumbnailUpload(true);
			return;
		}
		publishHandler(payload);
	};

	return (
		<Card className="relative items-center">
			<CardContent className="flex h-full justify-center px-4 md:px-8 w-full max-w-3xl ">
				{/* Show ThumbnailUpload modal/dialog if needed */}
				{showThumbnailUpload && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
						<div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 max-w-lg w-full">
							<ThumbnailUpload
								images={getImageUrls()}
								insertMedia={handleInsertMedia}
								closeHandler={() => setShowThumbnailUpload(false)}
							/>
						</div>
					</div>
				)}

				<div className="btn-container flex gap-4 -mt-2 mr-8 justify-end absolute top-0 z-50 right-0 -translate-y-full ">
					{action !== POST_ACTIONS.EDIT && (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										className="justify-center items-center flex ga-2"
										onClick={() => saveHandler(content)}
										disabled={actionDraftLoading || actionPublishLoading}
									>
										{actionDraftLoading ? (
											<Loader2 className="animate-spin" />
										) : (
											<CiSaveDown2 />
										)}
										<span className="invisible md:visible">Save</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Save as draft</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
					<Button
						disabled={actionDraftLoading || actionPublishLoading}
						onClick={handlePublish}
						className="bg-linear-to-tl from-blue-600 to-cyan-400 text-white flex gap-2 justify-center items-center disabled:from-gray-400 disabled:to-gray-300 disabled:cursor-not-allowed"
					>
						{actionPublishLoading ? (
							<Loader2 className="animate-spin" />
						) : (
							<MdOutlinePublish />
						)}
						<span className="hidden md:block">Publish</span>
					</Button>
				</div>
				<LexicalEditorWrapper
					key={postId}
					postId={postId}
					onChange={(data: EditorContent) =>
						updateContent({ post: { ...content.post, ...data } })
					}
					titlePlaceHolder={getTitlePlaceHolder()}
					contentPlaceHolder={getContentPlaceHolder()}
					defaultContent={savedData || defaultContent}
					dataLoading={dataLoading}
					answerHandler={
						postType === PostType.QUESTION
							? (data: EditorContent) => updateContent({ answer: data })
							: undefined
					}
					answerPlaceHolder="Provide a clear and helpful answer (required)..."
				/>
			</CardContent>
		</Card>
	);
}

export default EditorContainer;
