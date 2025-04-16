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
	const actionSavingLoading = false;
	return (
		<LexicalComposer initialConfig={initialConfig}>
			<SharedHistoryContext>
				<ToolbarContext>
					<div className="relative">
						<Core
							placeholder={placeholder}
							id={id}
							autoFocus={autoFocus}
							onChangeHandler={changeHandler}
						/>
						<Button
							disabled={false}
							onClick={() => null}
							className="rounded-full absolute right-0 bottom-0 bg-linear-to-tl from-blue-600 to-cyan-400 text-white flex gap-2 justify-center items-center disabled:from-gray-400 disabled:to-gray-300 disabled:cursor-not-allowed"
						>
							{actionSavingLoading ? (
								<Loader2 className="animate-spin" />
							) : (
								<FaRegCommentDots />
							)}
							<span className="hidden md:block font-semibold ">Comment</span>
						</Button>
					</div>
				</ToolbarContext>
			</SharedHistoryContext>
		</LexicalComposer>
	);
}
