"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Editor, InitialBlocks } from "./EditorQA"; // Assuming EditorQA exports the Editor component
import { Card, CardContent } from "@/components/ui/card";
import { OutputData } from "@editorjs/editorjs";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getLocalStorage, setLocalStorage } from "@/lib/localStorage";

export interface EditorContent extends OutputData {
	title?: string;
}

interface EditorQuestionProps {
	postId: string;
	defaultContent?: InitialBlocks;
	onChangeCallback: (data: InitialBlocks) => void;
	dataLoading?: boolean;
}

function EditorQuestion({
	postId,
	defaultContent,
	onChangeCallback,
	dataLoading,
}: EditorQuestionProps) {
	const [content, setContent] = useState<InitialBlocks>({
		post: { blocks: [] },
		answer: { blocks: [] },
	});

	const localStorageKey = `editor-${postId}`;
	const savedData = getLocalStorage<InitialBlocks>(localStorageKey);

	// Update parent and localStorage when state changes

	const updateContent = useCallback(
		(newContent: Partial<InitialBlocks>) => {
			setContent((prev) => {
				const updated = { ...prev, ...newContent };
				onChangeCallback(updated);
				setLocalStorage(localStorageKey, updated);
				return updated;
			});
		},
		[onChangeCallback, localStorageKey],
	);

	// Initialize state from defaultContent or localStorage
	useEffect(() => {
		const initialData = defaultContent || savedData || {};
		setContent({
			post: initialData.post || { blocks: [] },
			answer: initialData.answer || { blocks: [] },
		});
	}, [defaultContent, savedData]);

	return (
		<div className="flex flex-col gap-4">
			<Card className="h-full">
				<CardContent className="flex justify-center h-full">
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
						answerPlaceHolder="Provide a clear and helpful answer.."
					/>
				</CardContent>
			</Card>
		</div>
	);
}

export default EditorQuestion;
