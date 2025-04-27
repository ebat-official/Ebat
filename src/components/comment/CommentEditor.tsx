"use client";
import { SharedHistoryContext } from "../shared/Lexical Editor/providers/SharedHistoryContext";
import { ToolbarContext } from "../shared/Lexical Editor/providers/ToolbarContext";
import { LexicalComposer } from "@lexical/react/LexicalComposer";

import theme from "../shared/Lexical Editor/themes/editor-theme";
import Core from "./config/Core";
import nodes from "./config/nodes";
import type { SerializedEditorState } from "lexical";
import { beautifulMentionsTheme } from "../shared/Lexical Editor/ui/MentionMenu/MentionTheme";
import { MentionData } from "../shared/Lexical Editor/plugins/MentionPlugin/MentionChangePlugin";
interface EditorProps {
	isEditable?: boolean;
	content?: unknown;
	namespace?: string;
	placeholder?: string;
	id?: string;
	autoFocus?: boolean;
	onChangeHandler?: (data: SerializedEditorState) => void;
	onMentionChangeHandler: (mentions: MentionData[]) => void;
	ref?: React.RefObject<{ clearEditorContent: () => void } | undefined>;
}

export default function Editor({
	isEditable = true,
	content,
	placeholder = "Add a comment...",
	id = "comment",
	autoFocus = false,
	onChangeHandler,
	onMentionChangeHandler,
	ref,
}: EditorProps) {
	const initialConfig = {
		namespace: id,
		theme: {
			...theme,
			beautifulMentions: beautifulMentionsTheme,
		},
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
						onMentionChangeHandler={onMentionChangeHandler}
						ref={ref}
					/>
				</ToolbarContext>
			</SharedHistoryContext>
		</LexicalComposer>
	);
}
