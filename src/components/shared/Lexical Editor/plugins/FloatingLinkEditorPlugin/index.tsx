/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { JSX } from "react";

import {
	$createLinkNode,
	$isAutoLinkNode,
	$isLinkNode,
	TOGGLE_LINK_COMMAND,
} from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
	$getSelection,
	$isLineBreakNode,
	$isNodeSelection,
	$isRangeSelection,
	BaseSelection,
	CLICK_COMMAND,
	COMMAND_PRIORITY_CRITICAL,
	COMMAND_PRIORITY_HIGH,
	COMMAND_PRIORITY_LOW,
	getDOMSelection,
	KEY_ESCAPE_COMMAND,
	LexicalEditor,
	SELECTION_CHANGE_COMMAND,
} from "lexical";
import { Dispatch, useCallback, useEffect, useRef, useState } from "react";
import * as React from "react";
import { createPortal } from "react-dom";

import { getSelectedNode } from "../../utils/getSelectedNode";
import { setFloatingElemPositionForLinkEditor } from "../../utils/setFloatingElemPositionForLinkEditor";
import { sanitizeUrl } from "../../utils/url";
import { Button } from "@/components/ui/button";

function preventDefault(
	event: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLElement>,
): void {
	event.preventDefault();
}

function FloatingLinkEditor({
	editor,
	isLink,
	setIsLink,
	anchorElem,
	isLinkEditMode,
	setIsLinkEditMode,
}: {
	editor: LexicalEditor;
	isLink: boolean;
	setIsLink: Dispatch<boolean>;
	anchorElem: HTMLElement;
	isLinkEditMode: boolean;
	setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element {
	const editorRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const [linkUrl, setLinkUrl] = useState("");
	const [editedLinkUrl, setEditedLinkUrl] = useState("https://");
	const [lastSelection, setLastSelection] = useState<BaseSelection | null>(
		null,
	);

	// Close on outside click
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				editorRef.current &&
				!editorRef.current.contains(event.target as Node)
			) {
				setIsLinkEditMode(false);
				setIsLink(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [setIsLinkEditMode, setIsLink]);

	const $updateLinkEditor = useCallback(() => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			const node = getSelectedNode(selection);
			const linkParent = $findMatchingParent(node, $isLinkNode);

			if (linkParent) {
				setLinkUrl(linkParent.getURL());
			} else if ($isLinkNode(node)) {
				setLinkUrl(node.getURL());
			} else {
				setLinkUrl("");
			}
			if (isLinkEditMode) {
				setEditedLinkUrl(linkUrl);
			}
		} else if ($isNodeSelection(selection)) {
			const nodes = selection.getNodes();
			if (nodes.length > 0) {
				const node = nodes[0];
				const parent = node.getParent();
				if ($isLinkNode(parent)) {
					setLinkUrl(parent.getURL());
				} else if ($isLinkNode(node)) {
					setLinkUrl(node.getURL());
				} else {
					setLinkUrl("");
				}
				if (isLinkEditMode) {
					setEditedLinkUrl(linkUrl);
				}
			}
		}

		const editorElem = editorRef.current;
		const nativeSelection = getDOMSelection(editor._window);
		const activeElement = document.activeElement;

		if (editorElem === null) {
			return;
		}

		const rootElement = editor.getRootElement();

		if (selection !== null && rootElement !== null && editor.isEditable()) {
			let domRect: DOMRect | undefined;

			if ($isNodeSelection(selection)) {
				const nodes = selection.getNodes();
				if (nodes.length > 0) {
					const element = editor.getElementByKey(nodes[0].getKey());
					if (element) {
						domRect = element.getBoundingClientRect();
					}
				}
			} else if (
				nativeSelection !== null &&
				rootElement.contains(nativeSelection.anchorNode)
			) {
				domRect =
					nativeSelection.focusNode?.parentElement?.getBoundingClientRect();
			}

			if (domRect) {
				domRect.y += 40;
				setFloatingElemPositionForLinkEditor(domRect, editorElem, anchorElem);
			}
			setLastSelection(selection);
		} else if (
			!activeElement ||
			!activeElement.classList.contains("link-input")
		) {
			if (rootElement !== null) {
				setFloatingElemPositionForLinkEditor(null, editorElem, anchorElem);
			}
			setLastSelection(null);
			setIsLinkEditMode(false);
			setLinkUrl("");
		}

		return true;
	}, [anchorElem, editor, setIsLinkEditMode, isLinkEditMode, linkUrl]);

	useEffect(() => {
		const scrollerElem = anchorElem.parentElement;

		const update = () => {
			editor.getEditorState().read(() => {
				$updateLinkEditor();
			});
		};

		window.addEventListener("resize", update);

		if (scrollerElem) {
			scrollerElem.addEventListener("scroll", update);
		}

		return () => {
			window.removeEventListener("resize", update);

			if (scrollerElem) {
				scrollerElem.removeEventListener("scroll", update);
			}
		};
	}, [anchorElem.parentElement, editor, $updateLinkEditor]);

	useEffect(() => {
		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					$updateLinkEditor();
				});
			}),

			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				() => {
					$updateLinkEditor();
					return true;
				},
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand(
				KEY_ESCAPE_COMMAND,
				() => {
					if (isLink) {
						setIsLink(false);
						return true;
					}
					return false;
				},
				COMMAND_PRIORITY_HIGH,
			),
		);
	}, [editor, $updateLinkEditor, setIsLink, isLink]);

	useEffect(() => {
		editor.getEditorState().read(() => {
			$updateLinkEditor();
		});
	}, [editor, $updateLinkEditor]);

	useEffect(() => {
		if (isLinkEditMode && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isLinkEditMode, isLink]);

	const monitorInputInteraction = (
		event: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (event.key === "Enter") {
			handleLinkSubmission(event);
		} else if (event.key === "Escape") {
			event.preventDefault();
			setIsLinkEditMode(false);
		}
	};

	const handleLinkSubmission = (
		event:
			| React.KeyboardEvent<HTMLInputElement>
			| React.MouseEvent<HTMLElement>,
	) => {
		event.preventDefault();
		if (lastSelection !== null) {
			if (linkUrl !== "") {
				editor.update(() => {
					editor.dispatchCommand(
						TOGGLE_LINK_COMMAND,
						sanitizeUrl(editedLinkUrl),
					);
					const selection = $getSelection();
					if ($isRangeSelection(selection)) {
						const parent = getSelectedNode(selection).getParent();
						if ($isAutoLinkNode(parent)) {
							const linkNode = $createLinkNode(parent.getURL(), {
								rel: parent.__rel,
								target: parent.__target,
								title: parent.__title,
							});
							parent.replace(linkNode, true);
						}
					}
				});
			}
			setEditedLinkUrl("https://");
			setIsLinkEditMode(false);
		}
	};

	if (!isLink) return null;

	return (
		<div
			ref={editorRef}
			className="absolute left-0 top-0 z-10 max-w-[400px] transition-opacity duration-300 will-change-transform
        bg-white dark:bg-zinc-900 shadow-md border border-zinc-200 dark:border-zinc-800 rounded-lg"
		>
			{isLinkEditMode ? (
				<div className="flex items-center gap-2 p-2">
					<input
						ref={inputRef}
						className="flex-1 p-2 text-sm text-black bg-white border rounded link-input border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
						value={editedLinkUrl}
						onChange={(event) => setEditedLinkUrl(event.target.value)}
						onKeyDown={monitorInputInteraction}
					/>
					<Button
						variant="outline"
						className="p-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white"
						onClick={() => setIsLinkEditMode(false)}
					>
						✕
					</Button>
					<Button
						variant="outline"
						className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
						onClick={handleLinkSubmission}
					>
						✓
					</Button>
				</div>
			) : (
				<div className="flex items-center gap-2 p-2">
					<a
						href={sanitizeUrl(linkUrl)}
						target="_blank"
						rel="noopener noreferrer"
						className="flex-1 text-blue-600 truncate dark:text-blue-400 hover:underline"
					>
						{linkUrl}
					</a>
					<Button
						variant="outline"
						className="p-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white"
						onClick={(e) => {
							e.preventDefault();
							setEditedLinkUrl(linkUrl);
							setIsLinkEditMode(true);
						}}
					>
						✎
					</Button>
					<Button
						variant="outline"
						className="p-2 text-red-500 hover:text-red-700"
						onClick={() => editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)}
					>
						🗑
					</Button>
				</div>
			)}
		</div>
	);
}

function useFloatingLinkEditorToolbar(
	editor: LexicalEditor,
	anchorElem: HTMLElement,
	isLinkEditMode: boolean,
	setIsLinkEditMode: Dispatch<boolean>,
): JSX.Element | null {
	const [activeEditor, setActiveEditor] = useState(editor);
	const [isLink, setIsLink] = useState(false);

	useEffect(() => {
		function $updateToolbar() {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				const focusNode = getSelectedNode(selection);
				const focusLinkNode = $findMatchingParent(focusNode, $isLinkNode);
				const focusAutoLinkNode = $findMatchingParent(
					focusNode,
					$isAutoLinkNode,
				);
				if (!(focusLinkNode || focusAutoLinkNode)) {
					setIsLink(false);
					return;
				}
				const badNode = selection
					.getNodes()
					.filter((node) => !$isLineBreakNode(node))
					.find((node) => {
						const linkNode = $findMatchingParent(node, $isLinkNode);
						const autoLinkNode = $findMatchingParent(node, $isAutoLinkNode);
						return (
							(focusLinkNode && !focusLinkNode.is(linkNode)) ||
							(linkNode && !linkNode.is(focusLinkNode)) ||
							(focusAutoLinkNode && !focusAutoLinkNode.is(autoLinkNode)) ||
							(autoLinkNode &&
								(!autoLinkNode.is(focusAutoLinkNode) ||
									autoLinkNode.getIsUnlinked()))
						);
					});
				if (!badNode) {
					setIsLink(true);
				} else {
					setIsLink(false);
				}
			} else if ($isNodeSelection(selection)) {
				const nodes = selection.getNodes();
				if (nodes.length === 0) {
					setIsLink(false);
					return;
				}
				const node = nodes[0];
				const parent = node.getParent();
				if ($isLinkNode(parent) || $isLinkNode(node)) {
					setIsLink(true);
				} else {
					setIsLink(false);
				}
			}
		}
		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					$updateToolbar();
				});
			}),
			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				(_payload, newEditor) => {
					$updateToolbar();
					setActiveEditor(newEditor);
					return false;
				},
				COMMAND_PRIORITY_CRITICAL,
			),
			editor.registerCommand(
				CLICK_COMMAND,
				(payload) => {
					const selection = $getSelection();
					if ($isRangeSelection(selection)) {
						const node = getSelectedNode(selection);
						const linkNode = $findMatchingParent(node, $isLinkNode);
						if ($isLinkNode(linkNode) && (payload.metaKey || payload.ctrlKey)) {
							window.open(linkNode.getURL(), "_blank");
							return true;
						}
					}
					return false;
				},
				COMMAND_PRIORITY_LOW,
			),
		);
	}, [editor]);

	return createPortal(
		<FloatingLinkEditor
			editor={activeEditor}
			isLink={isLink}
			anchorElem={anchorElem}
			setIsLink={setIsLink}
			isLinkEditMode={isLinkEditMode}
			setIsLinkEditMode={setIsLinkEditMode}
		/>,
		anchorElem,
	);
}

export default function FloatingLinkEditorPlugin({
	anchorElem = document.body,
	isLinkEditMode,
	setIsLinkEditMode,
}: {
	anchorElem?: HTMLElement;
	isLinkEditMode: boolean;
	setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element | null {
	const [editor] = useLexicalComposerContext();
	return useFloatingLinkEditorToolbar(
		editor,
		anchorElem,
		isLinkEditMode,
		setIsLinkEditMode,
	);
}
