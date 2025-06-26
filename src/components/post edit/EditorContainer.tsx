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
import { Loader2, Code, FileCode2, Edit, Trash2, Info } from "lucide-react";
import { PostType, TemplateFramework } from "@prisma/client";
import { emptyEditorState } from "../shared/Lexical Editor/constants";
import { POST_ACTIONS } from "@/utils/contants";
import { useEditorContext } from "../shared/Lexical Editor/providers/EditorContext";
import { ThumbnailUpload } from "./ThumbnailUpload";
import { TemplateCreator } from "./challenge/TemplateCreator";
import type { FileSystemTree } from "../playground/lib/types";
import { FRAMEWORK_ICONS } from "@/components/post edit/constants";
import SavedTemplatesSkeleton from "./challenge/SavedTemplatesSkeleton";

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

interface ChallengeTemplate {
	framework: TemplateFramework;
	questionTemplate: FileSystemTree;
	answerTemplate: FileSystemTree;
	defaultFile?: string;
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

	// Memoize savedData to prevent unnecessary re-renders
	const savedData = useMemo(() => {
		return getLocalStorage<ContentType>(localStorageKey);
	}, [localStorageKey]);

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

	const closeThumbnailUpload = useCallback(() => {
		setShowThumbnailUpload(false);
	}, []);

	const handleSave = () => {
		const payload = getPayload();
		console.log(payload, "pranavvalidatediiiiii");
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
			// First check localStorage
			if (savedData?.challengeTemplates) {
				setChallengeTemplates(savedData.challengeTemplates);
			}
			// Then check prop
			else if (propChallengeTemplates) {
				setChallengeTemplates(propChallengeTemplates);
			}
			// Finally check defaultContent
			else if (initialData.challengeTemplates) {
				setChallengeTemplates(initialData.challengeTemplates);
			}
		}
	}, [
		defaultContent,
		savedData,
		postType,
		dataLoading,
		propChallengeTemplates,
	]);

	// Save challenge templates to localStorage whenever they change
	useEffect(() => {
		if (postType === PostType.CHALLENGE && challengeTemplates.length > 0) {
			const currentContent =
				getLocalStorage<ContentType>(localStorageKey) || {};
			setLocalStorage(localStorageKey, {
				...currentContent,
				challengeTemplates,
			});
		}
	}, [challengeTemplates, postType, localStorageKey]);

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

	const formatFrameworkName = (framework: string) => {
		return framework.toLowerCase().replace(/(^|\s)\S/g, (L) => L.toUpperCase());
	};

	console.log(challengeTemplates, "pranavchallengeTemplates");
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
						{challengeTemplates.length > 0 && !dataLoading && (
							<div className="mt-4">
								<div className="flex items-center gap-2 mb-3">
									<h5 className="text-sm font-medium">Saved Templates</h5>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Info className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help" />
											</TooltipTrigger>
											<TooltipContent>
												<p>
													Frameworks which this question can be resolved with
												</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
									{challengeTemplates.map((template) => {
										const FrameworkIcon = FRAMEWORK_ICONS[template.framework];
										return (
											<div
												key={template.framework}
												className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:shadow-md transition-all duration-200"
											>
												<div className="flex items-center gap-3">
													<FrameworkIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
													<div>
														<p className="font-medium text-sm text-gray-900 dark:text-gray-100">
															{formatFrameworkName(template.framework)}
														</p>
														<p className="text-xs text-gray-500 dark:text-gray-400">
															Template ready
														</p>
													</div>
												</div>
												<div className="flex items-center gap-1">
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => handleEditTemplate(template)}
																	className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30"
																>
																	<Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
																</Button>
															</TooltipTrigger>
															<TooltipContent>
																<p>Edit template</p>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() =>
																		handleDeleteTemplate(template.framework)
																	}
																	className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
																>
																	<Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
																</Button>
															</TooltipTrigger>
															<TooltipContent>
																<p>Delete template</p>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						)}
						{dataLoading && <SavedTemplatesSkeleton />}
					</CardContent>
				</Card>
			)}
		</div>
	);
}

export default EditorContainer;
