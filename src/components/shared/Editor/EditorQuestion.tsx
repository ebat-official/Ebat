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

interface EditorQuestionProps {
	postId: string;
	defaultContent?: ContentType;
	dataLoading?: boolean;
	saveHandler: (data: ContentType) => void;
	publishHanlder: (data: ContentType) => void;
}

function EditorQuestion({
	postId,
	defaultContent,
	dataLoading,
	saveHandler,
	publishHanlder,
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
									>
										<CiSaveDown2 />
										<span>Save</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Save as draft</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>

						<Button
							onClick={() => publishHanlder(content)}
							className="bg-gradient-to-tl from-blue-600 to-cyan-400 text-white flex gap-2 justify-center items-center"
						>
							<MdOutlinePublish />
							<span>Publish</span>
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
