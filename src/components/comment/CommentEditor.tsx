"use client";
import { SharedHistoryContext } from "../shared/Lexical Editor/providers/SharedHistoryContext";
import { ToolbarContext } from "../shared/Lexical Editor/providers/ToolbarContext";
import { LexicalComposer } from "@lexical/react/LexicalComposer";

import theme from "../shared/Lexical Editor/themes/editor-theme";
import Core from "./config/Core";
import nodes from "./config/nodes";
import { useEffect } from "react";
import type { SerializedEditorState } from "lexical";

interface EditorProps {
	isEditable: boolean;
	content?: unknown;
	namespace?: string;
	placeholder?: string;
	id?: string;
	autoFocus?: boolean;
	onChangeHandler?: (data: SerializedEditorState) => void;
}

export default function Editor({
	isEditable = true,
	content,
	placeholder = "Add a comment...",
	id = "ebatEditor",
	autoFocus = false,
	onChangeHandler,
}: EditorProps) {
	const initialConfig = {
		namespace: id,
		theme,
		editorState:
			typeof content === "string" ? content : JSON.stringify(content),
		nodes: [...nodes],
		onError: (error: Error) => {
			throw error;
		},
		editable: isEditable,
	};
	const changeHandler = onChangeHandler || (() => null);
	return (
		<LexicalComposer initialConfig={initialConfig}>
			<SharedHistoryContext>
				<ToolbarContext>
					<Core
						placeholder={placeholder}
						id={id}
						autoFocus={autoFocus}
						onChangeHandler={changeHandler}
					/>
				</ToolbarContext>
			</SharedHistoryContext>
		</LexicalComposer>
	);
}
