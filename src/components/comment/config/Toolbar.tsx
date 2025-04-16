"use client";

import { useEffect, useState, useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getSelection,
	$isRangeSelection,
	FORMAT_TEXT_COMMAND,
	SELECTION_CHANGE_COMMAND,
	COMMAND_PRIORITY_CRITICAL,
	$getRoot,
	$createTextNode,
} from "lexical";

import { Button } from "@/components/ui/button";
import {
	Bold,
	Italic,
	Strikethrough,
	Underline,
	Code,
	List,
	ListOrdered,
	Quote,
} from "lucide-react";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
	INSERT_UNORDERED_LIST_COMMAND,
	INSERT_ORDERED_LIST_COMMAND,
} from "@lexical/list";
import BlockFormatDropDown from "@/components/shared/Lexical Editor/ui/drop-downs/block-format";
import { useToolbarState } from "@/components/shared/Lexical Editor/providers/ToolbarContext";
import { $createCodeNode, $isCodeNode } from "@lexical/code";
import {
	$convertFromMarkdownString,
	$convertToMarkdownString,
} from "@lexical/markdown";
import { PLAYGROUND_TRANSFORMERS } from "@/components/shared/Lexical Editor/plugins/MarkdownTransformers";
import { Toggle } from "@/components/ui/toggle";
import { BsMarkdown } from "react-icons/bs";

export default function Toolbar() {
	const [editor] = useLexicalComposerContext(); // Use the editor instance from context
	const [isLink, setIsLink] = useState(false);
	const { toolbarState, updateToolbarState } = useToolbarState();

	// Update toolbar state when selection changes
	const updateToolbar = useCallback(() => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			updateToolbarState("isBold", selection.hasFormat("bold"));
			updateToolbarState("isItalic", selection.hasFormat("italic"));
			updateToolbarState("isUnderline", selection.hasFormat("underline"));
			updateToolbarState(
				"isStrikethrough",
				selection.hasFormat("strikethrough"),
			);
			updateToolbarState("isCode", selection.hasFormat("code"));

			const anchorNode = selection.anchor.getNode();
			const element =
				anchorNode.getKey() === "root"
					? anchorNode
					: anchorNode.getTopLevelElementOrThrow();

			if (element !== null) {
				const type = element.getType();
				updateToolbarState("blockType", type);
			}
		}
	}, [updateToolbarState]);

	useEffect(() => {
		return editor.registerCommand(
			SELECTION_CHANGE_COMMAND,
			() => {
				updateToolbar();
				return false;
			},
			COMMAND_PRIORITY_CRITICAL,
		);
	}, [editor, updateToolbar]);

	const insertLink = () => {
		if (!toolbarState.isLink) {
			editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
		} else {
			editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
		}
	};

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

	return (
		<div className=" z-10 flex items-center gap-2 pb-2">
			<Toggle
				variant={"outline"}
				onPressedChange={handleMarkdownToggle}
				pressed={toolbarState.isLink}
				aria-label="mark down"
				type="button"
			>
				<BsMarkdown />
			</Toggle>
			<BlockFormatDropDown
				commentMode
				blockType={toolbarState.blockType}
				editor={editor}
			/>
			{/* Bold */}
			<Button
				variant={toolbarState.isBold ? "default" : "ghost"}
				size="sm"
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
				aria-label="Bold"
			>
				<Bold className="w-4 h-4" />
			</Button>

			{/* Italic */}
			<Button
				variant={toolbarState.isItalic ? "default" : "ghost"}
				size="sm"
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
				aria-label="Italic"
			>
				<Italic className="w-4 h-4" />
			</Button>

			{/* Underline */}
			<Button
				variant={toolbarState.isUnderline ? "default" : "ghost"}
				size="sm"
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
				aria-label="Underline"
			>
				<Underline className="w-4 h-4" />
			</Button>

			{/* Strikethrough */}
			{/* <Button
        variant={toolbarState.isStrikethrough ? "default" : "ghost"}
        size="sm"
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
        }
        aria-label="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </Button> */}

			{/* Inline Code */}
			<Button
				variant={toolbarState.isCode ? "default" : "ghost"}
				size="sm"
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
				aria-label="Inline Code"
			>
				<Code className="w-4 h-4" />
			</Button>

			{/* Link */}
			<Button
				variant={toolbarState.isLink ? "default" : "ghost"}
				size="sm"
				onClick={insertLink}
				aria-label="Insert Link"
			>
				<Underline className="w-4 h-4" />
			</Button>
		</div>
	);
}
