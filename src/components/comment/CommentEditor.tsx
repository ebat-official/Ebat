"use client";
import { SharedHistoryContext } from "../shared/Lexical Editor/providers/SharedHistoryContext";
import { ToolbarContext } from "../shared/Lexical Editor/providers/ToolbarContext";
import { LexicalComposer } from "@lexical/react/LexicalComposer";

import theme from "../shared/Lexical Editor/themes/editor-theme";
import Core from "./config/Core";
import nodes from "./config/nodes";
import { useEffect } from "react";
import type { SerializedEditorState } from "lexical";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { MdOutlinePublish } from "react-icons/md";
import { TfiCommentsSmiley } from "react-icons/tfi";
import { BiCommentDetail } from "react-icons/bi";
import { FaRegCommentDots } from "react-icons/fa";
import { BeautifulMentionsTheme } from "lexical-beautiful-mentions";
import { beautifulMentionsTheme } from "../shared/Lexical Editor/ui/MentionMenu/MentionTheme";
interface EditorProps {
	isEditable?: boolean;
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
	id = "comment",
	autoFocus = false,
	onChangeHandler,
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
	const actionSavingLoading = false;
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
