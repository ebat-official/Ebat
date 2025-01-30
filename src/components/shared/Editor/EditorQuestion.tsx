"use client";
import React from "react";
import { Editor } from "./Editor";

function EditorQuestion() {
	return (
		<div className="flex flex-col gap-4">
			<Editor
				key="question"
				editorId="editor-question"
				onSave={(data) => console.log(data)}
			/>
			{/* <Editor
				key="answer"
				editorId="editor-answer"
				onSave={(data) => console.log(data)}
				showTitleField={false}
			/> */}
		</div>
	);
}

export default EditorQuestion;
