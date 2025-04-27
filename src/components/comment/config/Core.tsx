"use client";

declare global {
	interface Window {
		clearEditorContent?: () => void;
	}
}

import React, {
	useCallback,
	useImperativeHandle,
	useLayoutEffect,
	useState,
} from "react";
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
import {
	$createTextNode,
	$getRoot,
	BLUR_COMMAND,
	COMMAND_PRIORITY_LOW,
	FOCUS_COMMAND,
} from "lexical";
import type { SerializedEditorState } from "lexical";
import { Toggle } from "@/components/ui/toggle";
import { $createCodeNode, $isCodeNode } from "@lexical/code";
import {
	$convertFromMarkdownString,
	$convertToMarkdownString,
} from "@lexical/markdown";
import { PLAYGROUND_TRANSFORMERS } from "@/components/shared/Lexical Editor/plugins/MarkdownTransformers";
import { BsMarkdown } from "react-icons/bs";
import { BeautifulMentionsPlugin } from "lexical-beautiful-mentions";
import {
	MentionMenu,
	MentionMenuItem,
} from "@/components/shared/Lexical Editor/ui/MentionMenu/MentionMenu";
import { handleUserMentionSearch } from "@/utils/handleUserMentionSearch";
import {
	MentionChangePlugin,
	MentionData,
} from "@/components/shared/Lexical Editor/plugins/MentionPlugin/MentionChangePlugin";
import FloatingLinkEditorPlugin from "@/components/shared/Lexical Editor/plugins/FloatingLinkEditorPlugin";

interface CoreProps {
	placeholder: string;
	id: string;
	autoFocus?: boolean;
	onChangeHandler: (data: SerializedEditorState) => void;
	onMentionChangeHandler: (mentions: MentionData[]) => void;
	ref?: React.RefObject<HTMLElement | undefined>;
}

export default function Core({
	placeholder,
	id,
	autoFocus,
	onChangeHandler,
	onMentionChangeHandler,
	ref,
}: CoreProps) {
	const [editor] = useLexicalComposerContext();
	const [hasFocus, setHasFocus] = useState(() => {
		return editor.getRootElement() === document.activeElement;
	});
	const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);
	const [floatingAnchorElem, setFloatingAnchorElem] = useState<
		HTMLDivElement | undefined
	>();
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

	const clearEditorContent = () => {
		editor.update(() => {
			const root = $getRoot();
			root.clear();
		});
	};

	// Expose the clearEditorContent function to the parent via ref
	if (ref) {
		useImperativeHandle(ref, () => ({
			clearEditorContent,
		}));
	}

	const handleMarkdownToggle = useCallback(() => {
		editor.update(() => {
			const root = $getRoot();
			const firstChild = root.getFirstChild();
			if ($isCodeNode(firstChild) && firstChild?.getLanguage() === "markdown") {
				$convertFromMarkdownString(
					firstChild.getTextContent(),
					PLAYGROUND_TRANSFORMERS,
					undefined, // node
					true, //shouldPreserveNewLinesInMarkdown
				);
			} else {
				const markdown = $convertToMarkdownString(
					PLAYGROUND_TRANSFORMERS,
					undefined, //node
					true,
				);
				const codeNode = $createCodeNode("markdown");
				codeNode.append($createTextNode(markdown));
				root.clear().append(codeNode);
				if (markdown.length === 0) {
					codeNode.select();
				}
			}
		});
	}, [editor]);

	const onRef = useCallback((_floatingAnchorElem: HTMLDivElement) => {
		if (_floatingAnchorElem !== null) {
			setFloatingAnchorElem(_floatingAnchorElem);
		}
	}, []);

	return (
		<div className="relative flex flex-col editor">
			<div className="p-2">
				<RichTextPlugin
					contentEditable={
						<div className="relative" ref={onRef}>
							<ContentEditable
								id={id}
								autoFocus={autoFocus}
								className="z-20 p-1 border-0 outline-hidden min-h-20"
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
			<Toggle
				className="absolute right-3 -top-3"
				variant={"outline"}
				onPressedChange={handleMarkdownToggle}
				aria-label="mark down"
				type="button"
			>
				<BsMarkdown />
			</Toggle>
			<ToolbarPlugin />
			<LexicalOnChangePlugin onChangeHandler={onChangeHandler} />
			<LinkPlugin />
			<HorizontalRulePlugin />
			<ListPlugin />
			<MarkdownShortcutPlugin />
			<CodeHighlightPlugin />
			<HistoryPlugin />
			<TabIndentationPlugin maxIndent={3} />
			<FloatingLinkEditorPlugin
				anchorElem={floatingAnchorElem}
				isLinkEditMode={isLinkEditMode}
				setIsLinkEditMode={setIsLinkEditMode}
			/>
			<BeautifulMentionsPlugin
				triggers={["@"]}
				menuComponent={MentionMenu}
				menuItemComponent={MentionMenuItem}
				onSearch={handleUserMentionSearch}
			/>
			<MentionChangePlugin onMentionsChange={onMentionChangeHandler} />
		</div>
	);
}
