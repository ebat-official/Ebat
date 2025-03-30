import { $isCodeHighlightNode } from "@lexical/code";
import { $isLinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$findMatchingParent,
	$getNearestNodeOfType,
	mergeRegister,
} from "@lexical/utils";
import {
	$getSelection,
	$isParagraphNode,
	$isRangeSelection,
	$isRootOrShadowRoot,
	$isTextNode,
	getDOMSelection,
	LexicalEditor,
} from "lexical";
import { Dispatch, useCallback, useEffect, useState } from "react";
import * as React from "react";
import { createPortal } from "react-dom";

import { getSelectedNode } from "../../utils/getSelectedNode";

import { blockTypeToBlockName } from "../../providers/ToolbarContext";
import TextFormatFloatingToolbar from "../../ui/floting-text/write/text-format-floting-toolbar";
import { $getSelectionStyleValueForProperty } from "@lexical/selection";

import { useRef } from "react";
import { $isTableNode } from "@lexical/table";
import { $isListNode, ListNode } from "@lexical/list";
import { $isHeadingNode } from "@lexical/rich-text";

function useFloatingTextFormatToolbar(
	editor: LexicalEditor,
	anchorElem: HTMLElement,
	setIsLinkEditMode: Dispatch<boolean>,
): React.JSX.Element | null {
	const [isText, setIsText] = useState(false);
	const [isLink, setIsLink] = useState(false);
	const [isBold, setIsBold] = useState(false);
	const [isItalic, setIsItalic] = useState(false);
	const [isUnderline, setIsUnderline] = useState(false);
	const [isStrikethrough, setIsStrikethrough] = useState(false);
	const [isCode, setIsCode] = useState(false);
	const [fontColor, setFontColor] = useState<string>("#000000");
	const [bgColor, setBgColor] = useState<string>("#ffffff");
	const [fontFamily, setFontFamily] = useState<string>("Arial");
	const [blockType, setBlockType] =
		useState<keyof typeof blockTypeToBlockName>("paragraph");
	const [isUppercase, setIsUppercase] = useState(false);
	const [isLowercase, setIsLowercase] = useState(false);
	const [isCapitalize, setIsCapitalize] = useState(false);
	const [isSubscript, setIsSubscript] = useState(false);
	const [isSuperscript, setIsSuperscript] = useState(false);
	const [rootType, setRootType] = useState<"root" | "table">("root");
	const [textAlign, setTextAlign] = useState<
		"left" | "center" | "right" | "justify" | null
	>(null);
	const [fontSize, setFontSize] = useState<string>("16px");

	const toolbarRef = useRef<HTMLDivElement>(null);

	const updatePopup = useCallback(() => {
		editor.getEditorState().read(() => {
			if (editor.isComposing()) {
				return;
			}
			const selection = $getSelection();
			const nativeSelection = getDOMSelection(editor._window);
			const rootElement = editor.getRootElement();
			const aiElement = document.querySelector(".AI-format");

			if (
				nativeSelection &&
				nativeSelection.anchorNode instanceof HTMLElement &&
				nativeSelection.anchorNode.closest(".dropdown-portal")
			) {
				return;
			}

			if (
				nativeSelection !== null &&
				(!$isRangeSelection(selection) ||
					rootElement === null ||
					!rootElement.contains(nativeSelection.anchorNode)) &&
				!toolbarRef?.current?.contains(nativeSelection.anchorNode) &&
				!(aiElement && aiElement.contains(nativeSelection.anchorNode))
			) {
				setIsText(false);
				return;
			}

			if (!$isRangeSelection(selection)) {
				return;
			}

			const node = getSelectedNode(selection);

			// Update text format
			setIsBold(selection.hasFormat("bold"));
			setIsItalic(selection.hasFormat("italic"));
			setIsUnderline(selection.hasFormat("underline"));
			setIsStrikethrough(selection.hasFormat("strikethrough"));
			setIsSubscript(selection.hasFormat("subscript"));
			setIsLowercase(selection.hasFormat("lowercase"));
			setIsUppercase(selection.hasFormat("uppercase"));
			setIsCapitalize(selection.hasFormat("capitalize"));
			setIsSubscript(selection.hasFormat("subscript"));
			setIsSuperscript(selection.hasFormat("superscript"));

			setIsCode(selection.hasFormat("code"));
			const size = $getSelectionStyleValueForProperty(
				selection,
				"font-size",
				"16px",
			);
			setFontSize(size);
			const alignment = $getSelectionStyleValueForProperty(
				selection,
				"text-align",
				"left",
			);
			setTextAlign(alignment as "left" | "center" | "right" | "justify" | null);

			// Update links
			const parent = node.getParent();
			if ($isLinkNode(parent) || $isLinkNode(node)) {
				setIsLink(true);
			} else {
				setIsLink(false);
			}

			if (
				!$isCodeHighlightNode(selection.anchor.getNode()) &&
				selection.getTextContent() !== ""
			) {
				setIsText($isTextNode(node) || $isParagraphNode(node));
			} else {
				setIsText(false);
			}

			const rawTextContent = selection.getTextContent().replace(/\n/g, "");
			if (!selection.isCollapsed() && rawTextContent === "") {
				setIsText(false);
				return;
			}
			setFontFamily(
				$getSelectionStyleValueForProperty(selection, "font-family", "Arial"),
			);
			setFontColor($getSelectionStyleValueForProperty(selection, "color"));
			setBgColor(
				$getSelectionStyleValueForProperty(selection, "background-color"),
			);
			const tableNode = $findMatchingParent(node, $isTableNode);
			if ($isTableNode(tableNode)) {
				setRootType("table");
			} else {
				setRootType("root");
			}

			const anchorNode = selection.anchor.getNode();
			let element =
				anchorNode.getKey() === "root"
					? anchorNode
					: $findMatchingParent(anchorNode, (e) => {
							const parent = e.getParent();
							return parent !== null && $isRootOrShadowRoot(parent);
						});
			if ($isListNode(element)) {
				const parentList = $getNearestNodeOfType<ListNode>(
					anchorNode,
					ListNode,
				);

				const type = parentList
					? parentList.getListType()
					: element.getListType();
				setBlockType(type);
			} else {
				const type = $isHeadingNode(element)
					? element.getTag()
					: // @ts-ignore
						element.getType();
				setBlockType(type as keyof typeof blockTypeToBlockName);
			}
		});
	}, [editor]);

	useEffect(() => {
		const handleSelectionChange = () => {
			if (
				toolbarRef.current &&
				toolbarRef.current.contains(document.activeElement)
			) {
				return;
			}
			updatePopup();
		};

		document.addEventListener("selectionchange", handleSelectionChange);
		return () => {
			document.removeEventListener("selectionchange", handleSelectionChange);
		};
	}, [updatePopup]);

	useEffect(() => {
		return mergeRegister(
			editor.registerUpdateListener(() => {
				updatePopup();
			}),
			editor.registerRootListener(() => {
				if (editor.getRootElement() === null) {
					setIsText(false);
				}
			}),
		);
	}, [editor, updatePopup]);

	if (!isText) {
		return null;
	}

	return createPortal(
		<div ref={toolbarRef}>
			<TextFormatFloatingToolbar
				editor={editor}
				anchorElem={anchorElem}
				isLink={isLink}
				isBold={isBold}
				isItalic={isItalic}
				isStrikethrough={isStrikethrough}
				isUnderline={isUnderline}
				isCode={isCode}
				fontColor={fontColor}
				bgColor={bgColor}
				blockType={blockType}
				fontFamily={fontFamily}
				setIsLinkEditMode={setIsLinkEditMode}
				isUppercase={isUppercase}
				rootType={rootType}
				textAlign={textAlign}
				isLowercase={isLowercase}
				isCapitalize={isCapitalize}
				isSubscript={isSubscript}
				fontSize={fontSize}
				isSuperscript={isSuperscript}
			/>
		</div>,
		anchorElem,
	);
}

export default function FloatingTextFormatToolbarPlugin({
	anchorElem = document.body,
	setIsLinkEditMode,
}: {
	anchorElem?: HTMLElement;
	setIsLinkEditMode: Dispatch<boolean>;
}): React.JSX.Element | null {
	const [editor] = useLexicalComposerContext();

	return useFloatingTextFormatToolbar(editor, anchorElem, setIsLinkEditMode);

	// if (editor.isEditable())
	//   return useFloatingTextFormatToolbar(editor, anchorElem, setIsLinkEditMode);
	// else return useFloatingTextReadMode(editor, anchorElem);
}
