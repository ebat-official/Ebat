"use client";
import React, { useEffect, useState } from "react";
import { Editor } from "./Editor";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { AnswerValidator } from "@/lib/validators/answer";
import { OutputData } from "@editorjs/editorjs";
import useLocalStorage from "@/hooks/useLocalStorage";

export interface EditorContent extends OutputData {
	title?: string;
}
export interface QuestionAnswerType {
	post: EditorContent;
	answer: EditorContent;
}
interface EditorQuestionProps {
	postId: string;
	defaultContent?: QuestionAnswerType | undefined;
	onChangeCallback: (data: QuestionAnswerType) => void;
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
	const [localstorageContent, setLocalstorageContent] =
		useLocalStorage<QuestionAnswerType>(postId, {
			post: question,
			answer,
		});

	useEffect(() => {
		const data = { post: question, answer };
		onChangeCallback(data);
		setLocalstorageContent(data);
	}, [answer, question]);

	useEffect(() => {
		if (defaultContent) {
			setQuestion(defaultContent.post);
			setAnswer(defaultContent.answer);
		} else if (localstorageContent) {
			setQuestion(localstorageContent.post);
			setAnswer(localstorageContent.answer);
		}
	}, [defaultContent]);

	return (
		<div className="flex flex-col gap-4">
			<Card className="h-full">
				<CardContent className="flex justify-center h-full">
					<Editor
						key="question"
						editorId="editor-question"
						postId={postId}
						onChange={setQuestion}
						titlePlaceHolder="Question"
						contentPlaceHolder="Add more info to clarify (optional)..."
						showCommandDetail={false}
						defaultContent={defaultContent?.post || localstorageContent.post}
						dataLoading={dataLoading}
					/>
				</CardContent>
			</Card>
			<Card className="h-full">
				<CardContent className="flex justify-center h-full">
					<Editor
						key="answer"
						postId={postId}
						editorId="editor-answer"
						onChange={setAnswer}
						showTitleField={false}
						contentPlaceHolder="Provide a clear and helpful answer.."
						defaultContent={
							defaultContent?.answer || localstorageContent.answer
						}
						dataLoading={dataLoading}
					/>
				</CardContent>
			</Card>
		</div>
	);
}

export default EditorQuestion;
