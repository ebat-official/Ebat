"use client";
import React, { useEffect, useState } from "react";
import { Editor } from "./EditorQA"; // Assuming EditorQA exports the Editor component
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

interface EditorQuestionProps {
	postId: string;
	defaultContent?: ContentType;
	dataLoading?: boolean;
	saveHandler: (data: ContentType) => void;
	publishHandler: (data: ContentType) => void;
	actionDraftLoading?: boolean;
	actionPublishLoading?: boolean;
}

function EditorQuestion({
	postId,
	defaultContent,
	dataLoading,
	saveHandler,
	publishHandler,
	actionDraftLoading,
	actionPublishLoading,
}: EditorQuestionProps) {
	const [content, setContent] = useState<ContentType>({
		post: { blocks: [] },
		answer: { blocks: [] },
	});

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
		const initialData = defaultContent || savedData || {};
		setContent({
			post: initialData.post || { blocks: [] },
			answer: initialData.answer || { blocks: [] },
		});
	}, [defaultContent, savedData]);

	return (
		<Card>
			<CardContent className="flex justify-center h-full  relative">
				<>
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
							className="bg-gradient-to-tl from-blue-600 to-cyan-400 text-white flex gap-2 justify-center items-center disabled:from-gray-400 disabled:to-gray-300 disabled:cursor-not-allowed"
						>
							{actionPublishLoading ? (
								<Loader2 className="animate-spin" />
							) : (
								<MdOutlinePublish />
							)}
							<span className="hidden md:block">Publish</span>
						</Button>
					</div>
					<Editor
						key="question"
						postId={postId}
						onChange={(data: EditorContent) => updateContent({ post: data })}
						titlePlaceHolder="Question"
						contentPlaceHolder="Add more info to clarify (optional)..."
						defaultContent={defaultContent || savedData}
						dataLoading={dataLoading}
						answerHandler={(data: EditorContent) =>
							updateContent({ answer: data })
						}
						answerPlaceHolder="Provide a clear and helpful answer (required)..."
					/>
				</>
			</CardContent>
		</Card>
	);
}

export default EditorQuestion;
