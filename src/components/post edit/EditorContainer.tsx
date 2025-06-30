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
import {
	ContentType,
	EditorContent,
	PostActions,
	ChallengeTemplate,
} from "@/utils/types";
import { Loader2, Code, FileCode2 } from "lucide-react";
import { PostType, TemplateFramework } from "@prisma/client";
import { emptyEditorState } from "../shared/Lexical Editor/constants";
import { POST_ACTIONS } from "@/utils/contants";
import { useEditorContext } from "../shared/Lexical Editor/providers/EditorContext";
import { ThumbnailUpload } from "./ThumbnailUpload";
import { TemplateCreator } from "./challenge/TemplateCreator";
import { SavedTemplatesList } from "./challenge/SavedTemplatesList";

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
	challengeTemplates?: ChallengeTemplate[];
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
	challengeTemplates: propChallengeTemplates,
}: EditorContainerProps) {
	const [content, setContent] = useState<ContentType>({});
	const [thumbnail, setThumbnail] = useState<string | undefined>();
	const [showThumbnailUpload, setShowThumbnailUpload] = useState(false);
	const [challengeTemplates, setChallengeTemplates] = useState<
		ChallengeTemplate[]
	>([]);
	const [editingTemplate, setEditingTemplate] =
		useState<ChallengeTemplate | null>(null);
	const localStorageKey = `editor-${action}_${postId}`;
	const challengeTemplatesKey = `challenge-templates-${action}_${postId}`;

	// Memoize savedData to prevent unnecessary re-renders
	const savedData = useMemo(() => {
		return getLocalStorage<ContentType>(localStorageKey);
	}, [localStorageKey]);

	// Memoize saved challenge templates separately
	const savedChallengeTemplates = useMemo(() => {
		return getLocalStorage<ChallengeTemplate[]>(challengeTemplatesKey);
	}, [challengeTemplatesKey]);

	const { getImageUrls } = useEditorContext();

	// Memoize the payload getter
	const getPayload = () => {
		const thumbnailsArr = getImageUrls();
		return {
			...content,
			thumbnail: thumbnail || thumbnailsArr[0],
			challengeTemplates,
		};
	};

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

	const handleInsertMedia = async (file: { url: string; alt: string }) => {
		const payload = getPayload();
		await publishHandler({
			...payload,
			thumbnail: file.url || payload.thumbnail,
		});
		// Clear localStorage after successful publish
		setLocalStorage(localStorageKey, undefined);
		if (postType === PostType.CHALLENGE) {
			setLocalStorage(challengeTemplatesKey, undefined);
		}
		setShowThumbnailUpload(false);
	};

	const handlePublish = async () => {
		const payload = getPayload();
		// If thumbnail is required and not set, show the thumbnail upload
		if (postType === PostType.BLOGS || postType === PostType.SYSTEMDESIGN) {
			setShowThumbnailUpload(true);
			return;
		}
		await publishHandler(payload);
		// Clear localStorage after successful publish
		setLocalStorage(localStorageKey, undefined);
		if (postType === PostType.CHALLENGE) {
			setLocalStorage(challengeTemplatesKey, undefined);
		}
	};

	const closeThumbnailUpload = useCallback(() => {
		setShowThumbnailUpload(false);
	}, []);

	const handleSave = () => {
		const payload = getPayload();
		saveHandler(payload);
	};

	const handleTemplatesSave = useCallback((templates: ChallengeTemplate) => {
		setChallengeTemplates((prev) => {
			// Remove existing template for this framework if it exists
			const filtered = prev.filter((t) => t.framework !== templates.framework);
			// Add the new template
			return [...filtered, templates];
		});
		setEditingTemplate(null); // Close edit mode
	}, []);

	const handleEditTemplate = useCallback((template: ChallengeTemplate) => {
		setEditingTemplate(template);
	}, []);

	const handleDeleteTemplate = useCallback((framework: TemplateFramework) => {
		setChallengeTemplates((prev) =>
			prev.filter((t) => t.framework !== framework),
		);
	}, []);

	const handleCancelEdit = useCallback(() => {
		setEditingTemplate(null);
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

		// Load challenge templates with priority: localStorage > prop > defaultContent
		if (postType === PostType.CHALLENGE) {
			// First check localStorage (separate key)
			if (savedChallengeTemplates && savedChallengeTemplates.length > 0) {
				setChallengeTemplates(savedChallengeTemplates);
			}
			// Then check prop
			else if (propChallengeTemplates && propChallengeTemplates.length > 0) {
				setChallengeTemplates(propChallengeTemplates);
			}
			// Finally check defaultContent
			else if (
				initialData.challengeTemplates &&
				initialData.challengeTemplates.length > 0
			) {
				setChallengeTemplates(initialData.challengeTemplates);
			}
		}
	}, [
		defaultContent,
		savedData,
		savedChallengeTemplates,
		postType,
		dataLoading,
		propChallengeTemplates,
	]);

	// Save challenge templates to localStorage whenever they change
	useEffect(() => {
		if (postType === PostType.CHALLENGE && challengeTemplates.length > 0) {
			setLocalStorage(challengeTemplatesKey, challengeTemplates);
		}
	}, [challengeTemplates, postType, challengeTemplatesKey]);

	const getTitlePlaceHolder = () => {
		switch (postType) {
			case PostType.QUESTION:
			case PostType.CHALLENGE:
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
			case PostType.CHALLENGE:
				return "Add more info to clarify (optional)...";
			case PostType.BLOGS:
				return "Type your blog here...";
			case PostType.SYSTEMDESIGN:
				return "Design your system here...";
			default:
				return "Type your content here...";
		}
	};
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
						<TemplateCreator
							onTemplatesSave={handleTemplatesSave}
							editingTemplate={editingTemplate}
							onCancelEdit={handleCancelEdit}
							dataLoading={dataLoading}
							challengeTemplates={challengeTemplates}
						/>
						<SavedTemplatesList
							challengeTemplates={challengeTemplates}
							dataLoading={dataLoading || false}
							onEditTemplate={handleEditTemplate}
							onDeleteTemplate={handleDeleteTemplate}
						/>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

export default EditorContainer;
