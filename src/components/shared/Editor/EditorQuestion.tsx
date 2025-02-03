"use client";
import React from "react";
import { Editor } from "./Editor";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { PostValidator } from "@/lib/validators/post";
import { AnswerValidator } from "@/lib/validators/answer";

function EditorQuestion() {
	return (
		<div className="flex flex-col gap-4 h-full">
			<Card className="h-full">
				<CardContent className="flex justify-center h-full">
					<Editor
						key="question"
						editorId="editor-question"
						onChange={(data) => console.log(data)}
						titlePlaceHolder="Question"
						contentPlaceHolder="Add more info to clarify (optional)..."
						showCommandDetail={false}
						defaultContent={{
							title: "pranvee",
							time: 1738563917642,
							blocks: [
								{
									id: "5-sj1hEKO0",
									type: "paragraph",
									data: {
										text: "asdasd kettoda thendi",
									},
								},
							],
							version: "2.30.7",
						}}
					/>
				</CardContent>
			</Card>
			<Card className="h-full">
				<CardContent className="flex justify-center h-full">
					<Editor
						key="answer"
						editorId="editor-answer"
						onChange={(data) => console.log(data)}
						showTitleField={false}
						contentPlaceHolder="Provide a clear and helpful answer.."
					/>
				</CardContent>
			</Card>
		</div>
	);
}

export default EditorQuestion;
