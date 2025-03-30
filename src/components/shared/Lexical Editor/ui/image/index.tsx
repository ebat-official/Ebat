import type {
	BaseSelection,
	LexicalCommand,
	LexicalEditor,
	NodeKey,
} from "lexical";
import type { JSX } from "react";

import { LinkNode } from "@lexical/link";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import {
	$getNodeByKey,
	$getSelection,
	$isNodeSelection,
	$isRangeSelection,
	$setSelection,
	CLICK_COMMAND,
	COMMAND_PRIORITY_LOW,
	createCommand,
	DRAGSTART_COMMAND,
	KEY_BACKSPACE_COMMAND,
	KEY_DELETE_COMMAND,
	KEY_ENTER_COMMAND,
	KEY_ESCAPE_COMMAND,
	LineBreakNode,
	ParagraphNode,
	RootNode,
	SELECTION_CHANGE_COMMAND,
	TextNode,
} from "lexical";
import * as React from "react";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { $isImageNode } from "../../nodes/ImageNode";
import { useSharedHistoryContext } from "../../providers/SharedHistoryContext";
import ErrorImage from "./error-image";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import ImageResizer from "./image-resizer";
import LazyImage from "./lazy-image";
import LazyVideo from "./lazy-video";
import ImageToolBar from "./image-toolbar";

export const RIGHT_CLICK_IMAGE_COMMAND: LexicalCommand<MouseEvent> =
	createCommand("RIGHT_CLICK_IMAGE_COMMAND");

export default function ImageComponent({
	src,
	altText,
	nodeKey,
	width,
	height,
	maxWidth,
	resizable,
	showCaption,
	caption,
	rounded,
}: {
	altText: string;
	caption: LexicalEditor;
	height: "inherit" | number;
	maxWidth: number;
	nodeKey: NodeKey;
	resizable: boolean;
	showCaption: boolean;
	src: string;
	width: "inherit" | number;
	rounded: number;
	captionsEnabled: boolean;
}): JSX.Element {
	const MediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null); // Updated type
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	const [isSelected, setSelected, clearSelection] =
		useLexicalNodeSelection(nodeKey);
	const [isResizing, setIsResizing] = useState<boolean>(false);
	const [editor] = useLexicalComposerContext();
	const [selection, setSelection] = useState<BaseSelection | null>(null);
	const activeEditorRef = useRef<LexicalEditor | null>(null);
	const [isLoadError, setIsLoadError] = useState<boolean>(false);
	const isEditable = useLexicalEditable();
	const [MediaType, setMediaType] = useState<"IMAGE" | "VIDEO">("IMAGE");

	const $onDelete = useCallback(
		(payload: KeyboardEvent) => {
			const deleteSelection = $getSelection();
			if (isSelected && $isNodeSelection(deleteSelection)) {
				const event: KeyboardEvent = payload;
				event.preventDefault();
				deleteSelection.getNodes().forEach((node) => {
					if ($isImageNode(node)) {
						node.remove();
					}
				});
			}
			return false;
		},
		[isSelected],
	);

	const $onEnter = useCallback(
		(event: KeyboardEvent) => {
			const latestSelection = $getSelection();
			const buttonElem = buttonRef.current;
			if (
				isSelected &&
				$isNodeSelection(latestSelection) &&
				latestSelection.getNodes().length === 1
			) {
				if (showCaption) {
					// Move focus into nested editor
					$setSelection(null);
					event.preventDefault();
					caption.focus();
					return true;
				} else if (
					buttonElem !== null &&
					buttonElem !== document.activeElement
				) {
					event.preventDefault();
					buttonElem.focus();
					return true;
				}
			}
			return false;
		},
		[caption, isSelected, showCaption],
	);

	const $onEscape = useCallback(
		(event: KeyboardEvent) => {
			if (
				activeEditorRef.current === caption ||
				buttonRef.current === event.target
			) {
				$setSelection(null);
				editor.update(() => {
					setSelected(true);
					const parentRootElement = editor.getRootElement();
					if (parentRootElement !== null) {
						parentRootElement.focus();
					}
				});
				return true;
			}
			return false;
		},
		[caption, editor, setSelected],
	);

	const onClick = useCallback(
		(payload: MouseEvent) => {
			const event = payload;

			if (isResizing) {
				return true;
			}
			if (event.target === MediaRef.current) {
				if (event.shiftKey) {
					setSelected(!isSelected);
				} else {
					clearSelection();
					setSelected(true);
				}
				return true;
			}

			return false;
		},
		[isResizing, isSelected, setSelected, clearSelection],
	);

	const onRightClick = useCallback(
		(event: MouseEvent): void => {
			editor.getEditorState().read(() => {
				const latestSelection = $getSelection();
				const domElement = event.target as HTMLElement;
				if (
					(domElement.tagName === "IMG" || domElement.tagName === "VIDEO") &&
					$isRangeSelection(latestSelection) &&
					latestSelection.getNodes().length === 1
				) {
					editor.dispatchCommand(
						RIGHT_CLICK_IMAGE_COMMAND,
						event as MouseEvent,
					);
				}
			});
		},
		[editor],
	);

	useEffect(() => {
		let isMounted = true;
		const rootElement = editor.getRootElement();
		const unregister = mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				if (isMounted) {
					setSelection(editorState.read(() => $getSelection()));
				}
			}),
			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				(_, activeEditor) => {
					activeEditorRef.current = activeEditor;
					return false;
				},
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand<MouseEvent>(
				CLICK_COMMAND,
				onClick,
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand<MouseEvent>(
				RIGHT_CLICK_IMAGE_COMMAND,
				onClick,
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand(
				DRAGSTART_COMMAND,
				(event) => {
					if (event.target === MediaRef.current) {
						event.preventDefault();
						return true;
					}
					return false;
				},
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand(
				KEY_DELETE_COMMAND,
				$onDelete,
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand(
				KEY_BACKSPACE_COMMAND,
				$onDelete,
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand(KEY_ENTER_COMMAND, $onEnter, COMMAND_PRIORITY_LOW),
			editor.registerCommand(
				KEY_ESCAPE_COMMAND,
				$onEscape,
				COMMAND_PRIORITY_LOW,
			),
		);

		rootElement?.addEventListener("contextmenu", onRightClick);

		return () => {
			isMounted = false;
			unregister();
			rootElement?.removeEventListener("contextmenu", onRightClick);
		};
	}, [
		clearSelection,
		editor,
		isResizing,
		isSelected,
		nodeKey,
		$onDelete,
		$onEnter,
		$onEscape,
		onClick,
		onRightClick,
		setSelected,
	]);

	useEffect(() => {
		if (src.endsWith(".mp4")) {
			setMediaType("VIDEO");
		} else if (
			src.endsWith(".jpg") ||
			src.endsWith(".jpeg") ||
			src.endsWith(".png")
		) {
			setMediaType("IMAGE");
		}
	}, [src]);

	const onResizeEnd = (
		nextWidth: "inherit" | number,
		nextHeight: "inherit" | number,
	) => {
		setTimeout(() => {
			setIsResizing(false);
		}, 200);

		editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if ($isImageNode(node)) {
				node.setWidthAndHeight(nextWidth, nextHeight);
			}
		});
	};

	const onResizeStart = () => {
		setIsResizing(true);
	};

	const { historyState } = useSharedHistoryContext();

	const draggable = isSelected && $isNodeSelection(selection) && !isResizing;
	const isFocused = (isSelected || isResizing) && isEditable;

	return (
		<Suspense fallback={null}>
			<div className="relative inline-block group">
				<div draggable={draggable}>
					{isLoadError ? (
						<ErrorImage />
					) : (
						<>
							{MediaType === "IMAGE" ? (
								<LazyImage
									style={{
										width: width === "inherit" ? "400px" : `${width}px`,
										height: height === "inherit" ? "400px" : `${height}px`,
										borderRadius: `${rounded}px`,
									}}
									src={src}
									altText={altText}
									imageRef={MediaRef as React.RefObject<HTMLImageElement>}
									onError={() => setIsLoadError(true)}
								/>
							) : (
								<LazyVideo
									src={src}
									style={{
										width: width === "inherit" ? "800px" : `${width}px`,
										height: height === "inherit" ? "450px" : `${height}px`,
										borderRadius: `${rounded}px`,
									}}
									videoRef={MediaRef as React.RefObject<HTMLVideoElement>}
									onError={() => setIsLoadError(true)}
									rounded={rounded}
									controls={true}
								/>
							)}
						</>
					)}
				</div>
				{showCaption && (
					<div>
						<LexicalNestedComposer
							initialEditor={caption}
							initialNodes={[
								RootNode,
								TextNode,
								LineBreakNode,
								ParagraphNode,
								LinkNode,
							]}
						>
							<AutoFocusPlugin />
							<LinkPlugin />
							<HistoryPlugin externalHistoryState={historyState} />
							<RichTextPlugin
								contentEditable={
									<ContentEditable
										aria-placeholder="Enter a caption..."
										placeholder={() => (
											<span
												className="
                        color-[#999] text-xs overflow-hidden absolute  text-ellipsis
                        select-none text-nowrap inline-block pointer-events-none
                         transform -translate-x-1/2 -translate-y-1/2 bottom-[-8px]
                        "
											>
												Enter a caption...
											</span>
										)}
										className="relative text-xs text-center outline-none text-muted-foreground"
									/>
								}
								ErrorBoundary={LexicalErrorBoundary}
							/>
						</LexicalNestedComposer>
					</div>
				)}
				{isEditable && !isResizing && (
					<ImageToolBar
						width={width}
						height={height}
						editor={editor}
						nodeKey={nodeKey}
					/>
				)}

				{resizable && $isNodeSelection(selection) && isFocused && (
					<ImageResizer
						editor={editor}
						buttonRef={buttonRef}
						imageRef={MediaRef}
						maxWidth={maxWidth}
						setShowCaption={() => null}
						showCaption={false}
						captionsEnabled={false}
						onResizeStart={onResizeStart}
						onResizeEnd={onResizeEnd}
					/>
				)}
			</div>
		</Suspense>
	);
}
