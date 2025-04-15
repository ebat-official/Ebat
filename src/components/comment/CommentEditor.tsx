"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListNode, ListItemNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { LinkNode } from "@lexical/link";
import theme from "../shared/Lexical Editor/themes/editor-theme";

interface CommentEditorProps {
	placeholder?: string;
	onChangeHandler?: (editorState: string) => void;
}

export default function CommentEditor({
	placeholder = "Write a comment...",
	onChangeHandler,
}: CommentEditorProps) {
	const initialConfig = {
		namespace: "CommentEditor",
		theme,
		onError: (error: Error) => {
			console.error("Lexical Error:", error);
		},
		editable: true,
		nodes: [ListNode, ListItemNode, HeadingNode, QuoteNode, LinkNode], // Register required nodes
	};

	return (
		<LexicalComposer initialConfig={initialConfig}>
			<RichTextPlugin
				contentEditable={
					<div className="relative">
						<ContentEditable
							className="border  border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							aria-placeholder={placeholder}
							placeholder={
								<div className="text-primary opacity-60 overflow-hidden absolute truncate top-[7px] left-[10px] text-[15px] select-none inline-block pointer-events-none">
									{placeholder}
								</div>
							}
						/>
					</div>
				}
				ErrorBoundary={LexicalErrorBoundary}
			/>
			<OnChangePlugin
				onChange={(editorState) => {
					if (onChangeHandler) {
						const serializedState = JSON.stringify(editorState);
						onChangeHandler(serializedState);
					}
				}}
			/>
			<HistoryPlugin />
			<ListPlugin />
			<LinkPlugin />
			{/* <MarkdownShortcutPlugin /> */}
			<HorizontalRulePlugin />
			<CheckListPlugin />
			<TabIndentationPlugin maxIndent={3} />
		</LexicalComposer>
	);
}
