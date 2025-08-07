"use client";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { SharedHistoryContext } from "./providers/SharedHistoryContext";
import { ToolbarContext } from "./providers/ToolbarContext";

import { SerializedEditorState } from "lexical";
import { useEffect } from "react";
import Core from "./Core";
import nodes from "./nodes";
import { useEditorStore } from "@/store/useEditorStore";
import theme from "./themes/editor-theme";

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
	isEditable = false,
	content,
	placeholder = "",
	id = "ebatEditor",
	autoFocus = false,
	onChangeHandler,
}: EditorProps) {
	const { setId } = useEditorStore();
	useEffect(() => {
		setId(id);
	}, [id]);
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
