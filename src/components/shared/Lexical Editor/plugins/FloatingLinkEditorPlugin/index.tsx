import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Dispatch, JSX, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getSelectedNode } from "../../utils/getSelectedNode";
import {
	$createLinkNode,
	$isAutoLinkNode,
	$isLinkNode,
	TOGGLE_LINK_COMMAND,
} from "@lexical/link";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
	$getSelection,
	$isLineBreakNode,
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
import { sanitizeUrl } from "../../utils/url";
import { setFloatingElemPositionForLinkEditor } from "../../utils/setFloatingElemPositionForLinkEditor";
import { Input } from "@/components/ui/input";
import { Check, Edit2Icon, Link, X } from "lucide-react";
import { cn } from "@/lib/utils";
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

	const [urlLogo, setUrlLogo] = useState<string | null>(null);

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
		}
		const editorElem = editorRef.current;
		const nativeSelection = getDOMSelection(editor._window);
		const activeElement = document.activeElement;

		if (editorElem === null) {
			return;
		}

		const rootElement = editor.getRootElement();

		if (
			selection !== null &&
			nativeSelection !== null &&
			rootElement !== null &&
			rootElement.contains(nativeSelection.anchorNode) &&
			editor.isEditable()
		) {
			const domRect: DOMRect | undefined =
				nativeSelection.focusNode?.parentElement?.getBoundingClientRect();
			if (domRect) {
				domRect.y += 40;
				setFloatingElemPositionForLinkEditor(domRect, editorElem, anchorElem);
			}
			setLastSelection(selection);
		} else if (!activeElement || activeElement.className !== "link-input") {
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
			// Fetch metadata asynchronously AFTER editor update
			setEditedLinkUrl("https://");

			setIsLinkEditMode(false);
		}
	};

	return (
		<div
			ref={editorRef}
			className=" absolute max-w-96 bg-background max-sm:mx-1 w-full  border-0 top-0 left-0"
		>
			{isLinkEditMode ? (
				<div className=" relative w-full">
					<Link
						className={cn(
							"size-[14px] text-muted-foreground absolute  transition-colors duration-500 transform -translate-x-1/2 -translate-y-1/2 left-4 top-1/2",
							!!editedLinkUrl && "text-black dark:text-white",
						)}
					/>
					<Input
						placeholder="https://"
						value={editedLinkUrl}
						onChange={(event) => {
							setEditedLinkUrl(event.target.value);
						}}
						onKeyDown={(event) => {
							monitorInputInteraction(event);
						}}
						ref={inputRef}
						className="text-gray-900 pl-7 dark:text-gray-100 rounded-xl placeholder-gray-400 dark:placeholder-gray-500"
					/>
					<div className=" absolute  bg-background rounded-xl  flex flex-row  gap-x-1 items-center  transition-colors duration-500 transform -translate-y-1/2 right-2 top-1/2">
						<Button
							className=" rounded-xl h-6 w-6 flex items-center"
							variant={"destructive"}
							size="sm"
							tabIndex={0}
							onMouseDown={preventDefault}
							onClick={() => {
								setIsLinkEditMode(false);
							}}
						>
							<X />
						</Button>
						<Button
							className=" rounded-xl h-6 w-6 flex items-center"
							tabIndex={0}
							onMouseDown={preventDefault}
							onClick={handleLinkSubmission}
							size="sm"
						>
							<Check />
						</Button>
					</div>
				</div>
			) : (
				<div className="w-full border-input border rounded-xl h-9 flex items-center justify-between px-3 py-1 text-base shadow-xs ">
					<Link
						className={cn(
							"size-[14px] text-muted-foreground absolute  transition-colors duration-500 transform -translate-x-1/2 -translate-y-1/2 left-4 top-1/2",
							!!editedLinkUrl && "text-black dark:text-white",
						)}
					/>
					<a
						href={sanitizeUrl(linkUrl)}
						target="_blank"
						rel="noopener noreferrer"
						className="pl-4 mb-[1px]"
					>
						{linkUrl}
					</a>
					<div className=" absolute  bg-background rounded-xl  flex flex-row  gap-x-1 items-center  transition-colors duration-500 transform -translate-y-1/2 right-2 top-1/2">
						<Button
							className=" rounded-xl z-50 h-6 w-6 flex items-center"
							size="sm"
							tabIndex={0}
							onMouseDown={preventDefault}
							onClick={(event) => {
								event.preventDefault();
								setEditedLinkUrl(linkUrl);
								setIsLinkEditMode(true);
							}}
						>
							<Edit2Icon className="size-4" />
						</Button>
						<Button
							className=" rounded-xl h-6 w-6 flex items-center"
							tabIndex={0}
							variant={"secondary"}
							size="sm"
							onMouseDown={preventDefault}
							onClick={() => {
								editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
							}}
						>
							<X />
						</Button>
					</div>
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

	if (!isLink) return null;

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
