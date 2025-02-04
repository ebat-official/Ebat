"use client";
import React, { useEffect, useState } from "react";
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
	const [question, setQuestion] = useState<EditorContent>({ blocks: [] });
	const [answer, setAnswer] = useState<EditorContent>({ blocks: [] });

	const localStorageKey = `editor-${postId}`;
	const savedData = getLocalStorage<InitialBlocks>(localStorageKey);

	// Update parent and localStorage when state changes
	useEffect(() => {
		if (!postId) return;

		const data: InitialBlocks = { post: question, answer };
		onChangeCallback(data);
		setLocalStorage(localStorageKey, data);
	}, [answer, question]);

	// Initialize state from defaultContent or localStorage
	useEffect(() => {
		if (defaultContent) {
			setQuestion(defaultContent.post || { blocks: [] });
			setAnswer(defaultContent.answer || { blocks: [] });
		} else if (savedData) {
			setQuestion(savedData.post || { blocks: [] });
			setAnswer(savedData.answer || { blocks: [] });
		}
	}, [defaultContent]);

	return (
		<div className="flex flex-col gap-4">
			<Card className="h-full">
				<CardContent className="flex justify-center h-full">
					<Editor
						key="question"
						postId={postId}
						onChange={(data) => setQuestion(data)}
						titlePlaceHolder="Question"
						contentPlaceHolder="Add more info to clarify (optional)..."
						defaultContent={defaultContent || savedData}
						dataLoading={dataLoading}
						answerHandler={(data) => setAnswer(data)}
						answerPlaceHolder="Provide a clear and helpful answer.."
					/>
				</CardContent>
			</Card>
		</div>
	);
}

export default EditorQuestion;
