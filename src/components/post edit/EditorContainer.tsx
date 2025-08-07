"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	PostStatus,
	PostStatusType,
	PostType,
	TemplateFramework,
} from "@/db/schema/enums";
import { getLocalStorage, setLocalStorage } from "@/lib/localStorage";
import { POST_ACTIONS } from "@/utils/constants";
import {
	CategoryType,
	ChallengeTemplate,
	ContentType,
	EditorContent,
	PostActions,
	SubCategoryType,
} from "@/utils/types";
import {
	getTitlePlaceholder,
	getContentPlaceholder,
	getAnswerPlaceholder,
} from "./utils/placeholderUtils";
import { createPayload } from "./utils/editorUtils";
import {
	getLocalStorageKey,
	getChallengeTemplatesKey,
} from "./utils/storageUtils";
import { generatePreviewUrlForAction } from "./utils/previewUtils";
import { Code, FileCode2, Loader2 } from "lucide-react";
import React, {
	useEffect,
	useState,
	useMemo,
	useRef,
	useCallback,
} from "react";
import { CiSaveDown2 } from "react-icons/ci";
import { MdOutlinePublish } from "react-icons/md";
import { emptyEditorState } from "../shared/Lexical Editor/constants";
import { useEditorStore } from "@/store/useEditorStore";
import { LexicalEditorWrapper } from "./Editor";
import { ThumbnailUpload } from "./ThumbnailUpload";
import { SavedTemplatesList } from "./challenge/SavedTemplatesList";
import { TemplateCreator } from "./challenge/TemplateCreator";
import { Post } from "@/db/schema/zod-schemas";

type HandlerReturnType = {
	data?: unknown;
	error?: unknown;
	isLoading?: boolean;
};

interface EditorContainerProps {
	postId: string;
	postType: PostType;
	defaultContent?: ContentType;
	dataLoading?: boolean;
	saveHandler: (data: ContentType) => Promise<HandlerReturnType>;
	publishHandler: (
		data: ContentType,
		postStatus?: PostStatusType,
	) => Promise<HandlerReturnType>;
	actionDraftLoading?: boolean;
	actionPublishLoading?: boolean;
	action?: PostActions;
	challengeTemplates?: ChallengeTemplate[];
	category: CategoryType;
	subCategory: SubCategoryType;
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
	category,
	subCategory,
}: EditorContainerProps) {
	const [content, setContent] = useState<ContentType>({});
	const [thumbnail, setThumbnail] = useState<string | undefined>();
	const [challengeTemplates, setChallengeTemplates] = useState<
		ChallengeTemplate[]
	>([]);
	const [editingTemplate, setEditingTemplate] =
		useState<ChallengeTemplate | null>(null);
	const localStorageKey = getLocalStorageKey(action, postId);
	const challengeTemplatesKey = getChallengeTemplatesKey(action, postId);

	// Memoize savedData to prevent unnecessary re-renders
	const savedData = useMemo(() => {
		return getLocalStorage<ContentType>(localStorageKey);
	}, [localStorageKey]);

	// Memoize saved challenge templates separately
	const savedChallengeTemplates = useMemo(() => {
		return getLocalStorage<ChallengeTemplate[]>(challengeTemplatesKey);
	}, [challengeTemplatesKey]);

	const { getImageUrls } = useEditorStore();

	// Memoize the payload getter
	const getPayload = () => {
		return createPayload(content, challengeTemplates, thumbnail, getImageUrls);
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

	const handlePublish = async () => {
		const payload = getPayload();
		await publishHandler(payload);
		// Clear localStorage after successful publish
		setLocalStorage(localStorageKey, undefined);
		if (postType === PostType.CHALLENGE) {
			setLocalStorage(challengeTemplatesKey, undefined);
		}
	};

	const handleSave = async () => {
		const payload = getPayload();
		// If action is edit, publish the post as draft mode
		if (action === POST_ACTIONS.EDIT) {
			await publishHandler(getPayload(), PostStatus.DRAFT);
		} else {
			saveHandler(payload);
		}
	};

	const handlePreview = async () => {
		// If action is edit, publish the post as draft mode
		if (action === POST_ACTIONS.EDIT) {
			const res = await publishHandler(getPayload(), PostStatus.DRAFT);
			// Open preview URL in new window
			if (res.data) {
				const previewUrl = generatePreviewUrlForAction({
					category,
					subCategory,
					postType,
					postId,
					action,
				});
				window.open(previewUrl, "_blank");
			}
		} else {
			const payload = getPayload();
			await saveHandler(payload);
			const res = await saveHandler(getPayload());
			if (res.data) {
				const previewUrl = generatePreviewUrlForAction({
					category,
					subCategory,
					postType,
					postId,
					action,
				});
				window.open(previewUrl, "_blank");
			}
		}
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

	const getTitlePlaceHolder = () => getTitlePlaceholder(postType);
	const getContentPlaceHolder = () => getContentPlaceholder(postType);
	return (
		<div className="flex flex-col gap-4">
			<Card className="relative items-center">
				<CardContent className="flex h-full justify-center px-4 md:px-8 w-full max-w-3xl ">
					{/* Show ThumbnailUpload modal/dialog if needed */}
					{/* Removed ThumbnailUpload component */}

					<div className="btn-container flex gap-4 -mt-2 mr-8 justify-end absolute top-0 z-50 right-0 -translate-y-full ">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										className="justify-center items-center flex ga-2"
										onClick={handlePreview}
										disabled={actionDraftLoading || actionPublishLoading}
									>
										{actionDraftLoading ? (
											<Loader2 className="animate-spin" />
										) : (
											<Code />
										)}
										<span className="hidden md:block">Preview</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Preview post</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>

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
										<span className="hidden md:block">Save</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Save as draft</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>

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
						answerPlaceHolder={getAnswerPlaceholder()}
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
