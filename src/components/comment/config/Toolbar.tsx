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

import { EditorBlockType } from "@/utils/types";

import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, Code, Link } from "lucide-react";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";

import BlockFormatDropDown from "@/components/shared/Lexical Editor/ui/drop-downs/block-format";
import { useToolbarState } from "@/components/shared/Lexical Editor/providers/ToolbarContext";
import { sanitizeUrl } from "@/components/shared/Lexical Editor/utils/url";

export default function Toolbar() {
	const [editor] = useLexicalComposerContext(); // Use the editor instance from context
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
				const type = element.getType() as EditorBlockType; // Cast to BlockType
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

	const insertLink = useCallback(() => {
		if (!toolbarState.isLink) {
			editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl("https://"));
		} else {
			editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
		}
	}, [editor, toolbarState.isLink]);

	return (
		<div className="flex items-center lg:gap-2">
			<BlockFormatDropDown
				commentMode
				blockType={
					toolbarState.blockType as
						| "number"
						| "paragraph"
						| "bullet"
						| "code"
						| "h1"
						| "h2"
						| "h3"
						| "h4"
						| "h5"
						| "h6"
						| "quote"
				} // Narrow blockType to allowed values
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
				<Link className="w-4 h-4" />
			</Button>
		</div>
	);
}
