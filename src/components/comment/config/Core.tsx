"use client";

import React, { useCallback, useLayoutEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { LexicalOnChangePlugin } from "../../shared/Lexical Editor/lexical-on-change";
import CodeHighlightPlugin from "../../shared/Lexical Editor/plugins/CodeHighlightPlugin";
import ToolbarPlugin from "./Toolbar";
import { mergeRegister } from "@lexical/utils";
import { BLUR_COMMAND, COMMAND_PRIORITY_LOW, FOCUS_COMMAND } from "lexical";
import type { SerializedEditorState } from "lexical";

interface CoreProps {
	placeholder: string;
	id: string;
	autoFocus?: boolean;
	onChangeHandler: (data: SerializedEditorState) => void;
}

export default function Core({
	placeholder,
	id,
	autoFocus,
	onChangeHandler,
}: CoreProps) {
	const [editor] = useLexicalComposerContext();
	const [hasFocus, setHasFocus] = useState(() => {
		return editor.getRootElement() === document.activeElement;
	});

	useLayoutEffect(() => {
		setHasFocus(editor.getRootElement() === document.activeElement);
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
		<div className="relative flex editor flex-col">
			<div className="pl-2">
				<RichTextPlugin
					contentEditable={
						<div className="relative">
							<ContentEditable
								id={id}
								autoFocus={autoFocus}
								className="z-20 p-1 border-0 outline-hidden min-h-40 "
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
			</div>
			<ToolbarPlugin />
			<LexicalOnChangePlugin onChangeHandler={onChangeHandler} />
			<LinkPlugin />
			<HorizontalRulePlugin />
			<ListPlugin />
			<MarkdownShortcutPlugin />
			<CodeHighlightPlugin />
			<HistoryPlugin />
			<TabIndentationPlugin maxIndent={3} />
		</div>
	);
}
