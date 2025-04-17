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
	id = "ebatEditor",
	autoFocus = false,
	onChangeHandler,
}: EditorProps) {
	const mentionsStyle =
		"px-1 mx-2/3 mx-px align-baseline inline-block rounded break-words cursor-pointer leading-5";
	const mentionsStyleFocused = "ring-2 ring-offset-1";

	const beautifulMentionsTheme: BeautifulMentionsTheme = {
		"@": `${mentionsStyle} bg-green-600 text-accent`,
		"@Focused": `${mentionsStyleFocused} dark:ring-green-500 ring-green-600 ring-offset-background`,
		"rec:": {
			trigger: "text-blue-500",
			value: "text-orange-500",
			container:
				"mx-[2px] px-[4px] rounded border border-muted cursor-pointer bg-red-500",
			containerFocused:
				"mx-[2px] px-[4px] rounded border border-muted cursor-pointer",
		},
		"\\w+:": `${mentionsStyle} dark:bg-gray-400 bg-gray-500 text-accent`,
		"\\w+:Focused": `${mentionsStyleFocused} dark:ring-gray-400 ring-gray-500 ring-offset-background`,
	};
	const initialConfig = {
		namespace: id,
		theme: {
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
