import React, { useCallback, useLayoutEffect, useState } from "react";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { mergeRegister } from "@lexical/utils";
import { BLUR_COMMAND, COMMAND_PRIORITY_LOW, FOCUS_COMMAND } from "lexical";

interface SimpleEditorProps {
	placeholder?: string;
	autoFocus?: boolean;
	onChange?: (editorState: string) => void;
}

export default function SimpleEditor({
	placeholder = "Write something...",
	autoFocus = false,
	onChange,
}: SimpleEditorProps) {
	const [editor] = useLexicalComposerContext();
	const isEditable = useLexicalEditable();
	const [hasFocus, setHasFocus] = useState(false);

	useLayoutEffect(() => {
		return mergeRegister(
			editor.registerCommand(
				FOCUS_COMMAND,
				() => {
					setHasFocus(true);
					return false;
				},
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand(
				BLUR_COMMAND,
				() => {
					setHasFocus(false);
					return false;
				},
				COMMAND_PRIORITY_LOW,
			),
		);
	}, [editor]);

	return (
		<div className="editor-container">
			<RichTextPlugin
				contentEditable={
					<div className="editor-inner">
						<ContentEditable
							className="editor-content"
							autoFocus={autoFocus}
							aria-placeholder={placeholder}
							placeholder={
								<div className="editor-placeholder">{placeholder}</div>
							}
						/>
					</div>
				}
				ErrorBoundary={LexicalErrorBoundary}
			/>

			{/* Core Plugins */}
			<ClearEditorPlugin />
			<HistoryPlugin />
			<LinkPlugin />
			<HorizontalRulePlugin />
			<ListPlugin />
			<CheckListPlugin />
			<TablePlugin />
			<MarkdownShortcutPlugin />
			<ClickableLinkPlugin />
			<TabIndentationPlugin />
		</div>
	);
}
