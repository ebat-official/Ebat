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
import { ContentType, EditorContent } from "@/utils/types";
import { Loader2 } from "lucide-react";
import { PostType } from "@prisma/client";
import { emptyEditorState } from "../Lexical Editor/constants";

interface EditorContainerProps {
	postId: string;
	postType: PostType;
	defaultContent?: ContentType;
	dataLoading?: boolean;
	saveHandler: (data: ContentType) => void;
	publishHandler: (data: ContentType) => void;
	actionDraftLoading?: boolean;
	actionPublishLoading?: boolean;
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
}: EditorContainerProps) {
	const [content, setContent] = useState<ContentType>({});

	const localStorageKey = `editor-${postId}`;
	const savedData = getLocalStorage<ContentType>(localStorageKey);

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
	}, [defaultContent, savedData]);

	const getTitlePlaceHolder = () => {
		switch (postType) {
			case PostType.QUESTION:
				return "Question";
			case PostType.BLOGS:
				return "Title";
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

	return (
		<Card className="relative">
			<CardContent className="flex h-full justify-center  ">
				<div className="btn-container flex gap-4 -mt-2 mr-8 justify-end absolute top-0 right-0 -translate-y-full">
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

					<Button
						disabled={actionDraftLoading || actionPublishLoading}
						onClick={() => publishHandler(content)}
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
					key="question"
					postId={postId}
					onChange={(data: EditorContent) => updateContent({ post: data })}
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
