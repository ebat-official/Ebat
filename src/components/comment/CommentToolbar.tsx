"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getSelection,
	$isRangeSelection,
	FORMAT_TEXT_COMMAND,
	SELECTION_CHANGE_COMMAND,
	COMMAND_PRIORITY_LOW,
	$createTextNode,
	$isParagraphNode,
	$getNodeByKey,
	$createParagraphNode,
} from "lexical";
import { mergeRegister } from "@lexical/utils";
import { useEffect, useState } from "react";
import {
	Bold,
	Italic,
	Underline,
	Code,
	List,
	ListOrdered,
	Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { $createQuoteNode, $isQuoteNode } from "@lexical/rich-text";
import { $createHeadingNode, $isHeadingNode } from "@lexical/rich-text";
import { $createCodeNode, $isCodeNode } from "@lexical/code";
import {
	INSERT_UNORDERED_LIST_COMMAND,
	INSERT_ORDERED_LIST_COMMAND,
} from "@lexical/list";
import BlockFormatDropDown from "../shared/Lexical Editor/ui/drop-downs/block-format";
import { useToolbarState } from "../shared/Lexical Editor/providers/ToolbarContext";

export default function CommentToolbar() {
	const [editor] = useLexicalComposerContext();
	const [activeEditor, setActiveEditor] = useState(editor);
	const [isBold, setIsBold] = useState(false);
	const [isItalic, setIsItalic] = useState(false);
	const [isUnderline, setIsUnderline] = useState(false);
	const [isInlineCode, setIsInlineCode] = useState(false);
	const [blockType, setBlockType] = useState("paragraph");
	const { toolbarState, updateToolbarState } = useToolbarState();
	useEffect(() => {
		return editor.registerCommand(
			SELECTION_CHANGE_COMMAND,
			(_payload, newEditor) => {
				setActiveEditor(newEditor);
				return false;
			},
			COMMAND_PRIORITY_LOW,
		);
	}, [editor]);

	useEffect(() => {
		return mergeRegister(
			activeEditor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					const selection = $getSelection();
					if ($isRangeSelection(selection)) {
						setIsBold(selection.hasFormat("bold"));
						setIsItalic(selection.hasFormat("italic"));
						setIsUnderline(selection.hasFormat("underline"));
						setIsInlineCode(selection.hasFormat("code"));

						const anchorNode = selection.anchor.getNode();
						const element =
							anchorNode.getKey() === "root"
								? anchorNode
								: anchorNode.getTopLevelElementOrThrow();

						if ($isHeadingNode(element)) {
							setBlockType(`h${element.getTag()}`);
						} else if ($isCodeNode(element)) {
							setBlockType("code");
						} else if ($isQuoteNode(element)) {
							setBlockType("quote");
						} else if ($isParagraphNode(element)) {
							setBlockType("paragraph");
						}
					}
				});
			}),
		);
	}, [activeEditor]);

	const formatHeading = (level: 1 | 2 | 3) => {
		activeEditor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				const nodes = selection.getNodes();

				if (nodes.length === 1 && $isHeadingNode(nodes[0])) {
					// If already a heading, toggle back to paragraph
					const headingNode = nodes[0];
					const paragraphNode = $createParagraphNode();
					const children = headingNode.getChildren();
					paragraphNode.append(...children);
					headingNode.replace(paragraphNode);
					setBlockType("paragraph");
				} else {
					// Convert to heading
					const headingNode = $createHeadingNode(`h${level}`);
					const selectedText = selection.getTextContent();

					if (selectedText) {
						headingNode.append($createTextNode(selectedText));
						selection.insertNodes([headingNode]);
					} else {
						selection.insertNodes([headingNode]);
					}
					setBlockType(`h${level}`);
				}
			}
		});
	};

	const formatQuote = () => {
		activeEditor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				const nodes = selection.getNodes();

				if (nodes.length === 1 && $isQuoteNode(nodes[0])) {
					// If already a quote, toggle back to paragraph
					const quoteNode = nodes[0];
					const paragraphNode = $createParagraphNode();
					const children = quoteNode.getChildren();
					paragraphNode.append(...children);
					quoteNode.replace(paragraphNode);
					setBlockType("paragraph");
				} else {
					// Convert to quote
					const quoteNode = $createQuoteNode();
					const selectedText = selection.getTextContent();

					if (selectedText) {
						quoteNode.append($createTextNode(selectedText));
						selection.insertNodes([quoteNode]);
					} else {
						selection.insertNodes([quoteNode]);
					}
					setBlockType("quote");
				}
			}
		});
	};

	const formatCodeBlock = () => {
		activeEditor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				const nodes = selection.getNodes();

				if (nodes.length === 1 && $isCodeNode(nodes[0])) {
					// If already a code block, toggle back to paragraph
					const codeNode = nodes[0];
					const paragraphNode = $createParagraphNode();
					const children = codeNode.getChildren();
					paragraphNode.append(...children);
					codeNode.replace(paragraphNode);
					setBlockType("paragraph");
				} else {
					// Convert to code block
					const codeNode = $createCodeNode();
					const selectedText = selection.getTextContent();

					if (selectedText) {
						codeNode.append($createTextNode(selectedText));
						selection.insertNodes([codeNode]);
					} else {
						selection.insertNodes([codeNode]);
					}
					setBlockType("code");
				}
			}
		});
	};

	return (
		<div className="flex items-center gap-1 p-1 border rounded-t-lg bg-background flex-wrap">
			{/* Text Formatting */}
			<BlockFormatDropDown
				disabled={false}
				blockType={toolbarState.blockType}
				editor={activeEditor}
			/>
			<Button
				variant={isBold ? "default" : "ghost"}
				size="sm"
				onClick={() =>
					activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")
				}
				aria-label="Bold"
			>
				<Bold className="w-4 h-4" />
			</Button>

			<Button
				variant={isItalic ? "default" : "ghost"}
				size="sm"
				onClick={() =>
					activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")
				}
				aria-label="Italic"
			>
				<Italic className="w-4 h-4" />
			</Button>

			<Button
				variant={isUnderline ? "default" : "ghost"}
				size="sm"
				onClick={() =>
					activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
				}
				aria-label="Underline"
			>
				<Underline className="w-4 h-4" />
			</Button>

			<Button
				variant={isInlineCode ? "default" : "ghost"}
				size="sm"
				onClick={() =>
					activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")
				}
				aria-label="Inline Code"
			>
				<Code className="w-4 h-4" />
			</Button>
		</div>
	);
}
