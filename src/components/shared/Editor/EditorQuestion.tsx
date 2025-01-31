"use client";
import React from "react";
import { Editor } from "./Editor";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";

function EditorQuestion() {
	return (
		<div className="flex flex-col gap-4 min-h-[75%]">
			<Card className="flex-1">
				<CardContent className="flex justify-center ">
					<Editor
						key="question"
						editorId="editor-question"
						onSave={(data) => console.log(data)}
						titlePlaceHolder="Question"
						contentPlaceHolder="Add more info to clarify (optional)..."
					/>
				</CardContent>
			</Card>
			<Card className="">
				<CardContent className="flex justify-center">
					<Editor
						key="answer"
						editorId="editor-answer"
						onSave={(data) => console.log(data)}
						showTitleField={false}
						showCommandDetail={false}
						contentPlaceHolder="Provide a clear and helpful answer.."
					/>
				</CardContent>
			</Card>
		</div>
	);
}

export default EditorQuestion;
