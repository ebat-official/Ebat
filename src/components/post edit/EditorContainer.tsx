"use client";
import React, {
	useEffect,
	useState,
	useMemo,
	useRef,
	useCallback,
} from "react";
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
import { Loader2, Code, FileCode2 } from "lucide-react";
import { PostType, TemplateFramework } from "@prisma/client";
import { emptyEditorState } from "../shared/Lexical Editor/constants";
import { POST_ACTIONS } from "@/utils/contants";
import { useEditorContext } from "../shared/Lexical Editor/providers/EditorContext";
import { ThumbnailUpload } from "./ThumbnailUpload";
import { TemplateCreator } from "./TemplateCreator";
import type { FileSystemTree } from "../playground/lib/types";

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

interface ChallengeTemplate {
	framework: TemplateFramework;
	questionTemplate: FileSystemTree;
	answerTemplate: FileSystemTree;
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
	const [challengeTemplates, setChallengeTemplates] = useState<
		ChallengeTemplate[]
	>([]);
	const localStorageKey = `editor-${action}_${postId}`;

	// Memoize savedData to prevent unnecessary re-renders
	const savedData = useMemo(() => {
		return getLocalStorage<ContentType>(localStorageKey);
	}, [localStorageKey]);

	const { getImageUrls } = useEditorContext();

	// Memoize the payload getter
	const getPayload = useMemo(() => {
		const thumbnailsArr = getImageUrls();
		return { ...content, thumbnail: thumbnail || thumbnailsArr[0] };
	}, [content, thumbnail, getImageUrls]);

	// Memoize callback functions to prevent child re-renders
	const updateContent = useCallback(
		(newContent: Partial<ContentType>) => {
			setContent((prev) => {
				const updated = { ...prev, ...newContent };
				setLocalStorage(localStorageKey, updated);
				return updated;
			});
		},
		[localStorageKey],
	);

	const handleInsertMedia = useCallback(
		(file: { url: string; alt: string }) => {
			const payload = getPayload;
			publishHandler({ ...payload, thumbnail: file.url || payload.thumbnail });
			setShowThumbnailUpload(false);
		},
		[publishHandler, getPayload],
	);

	const handlePublish = useCallback(() => {
		const payload = getPayload;
		// If thumbnail is required and not set, show the thumbnail upload
		if (postType === PostType.BLOGS || postType === PostType.SYSTEMDESIGN) {
			setShowThumbnailUpload(true);
			return;
		}
		publishHandler(payload);
	}, [postType, publishHandler, getPayload]);

	const closeThumbnailUpload = useCallback(() => {
		setShowThumbnailUpload(false);
	}, []);

	const handleSave = useCallback(() => {
		saveHandler(content);
	}, [saveHandler, content]);

	const handleTemplatesSave = useCallback((templates: ChallengeTemplate) => {
		setChallengeTemplates((prev) => {
			// Remove existing template for this framework if it exists
			const filtered = prev.filter((t) => t.framework !== templates.framework);
			// Add the new template
			return [...filtered, templates];
		});
	}, []);

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
	console.log(challengeTemplates, "challengeTemplates");
	return (
		<div className="flex flex-col gap-4">
			<Card className="relative items-center">
				<CardContent className="flex h-full justify-center px-4 md:px-8 w-full max-w-3xl ">
					{/* Show ThumbnailUpload modal/dialog if needed */}
					{showThumbnailUpload && (
						<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
							<div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 max-w-lg w-full">
								<ThumbnailUpload
									images={getImageUrls()}
									insertMedia={handleInsertMedia}
									closeHandler={closeThumbnailUpload}
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
											onClick={handleSave}
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
							postType === PostType.QUESTION || postType === PostType.CHALLENGE
								? (data: EditorContent) => updateContent({ answer: data })
								: undefined
						}
						answerPlaceHolder="Provide a clear and helpful answer (required)..."
					/>
				</CardContent>
			</Card>
			{postType === PostType.CHALLENGE && (
				<Card>
					<CardContent className="flex flex-col h-full justify-center gap-4 w-full">
						<h4 className="font-medium opacity-90 flex items-center gap-2">
							<FileCode2 className="w-5 h-5" />
							Add your solution
						</h4>
						<TemplateCreator onTemplatesSave={handleTemplatesSave} />
						{challengeTemplates.length > 0 && (
							<div className="mt-4">
								<h5 className="text-sm font-medium mb-2">Saved Templates:</h5>
								<div className="flex flex-wrap gap-2">
									{challengeTemplates.map((template, index) => (
										<div
											key={template.framework}
											className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
										>
											{template.framework}
										</div>
									))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
}

export default EditorContainer;
