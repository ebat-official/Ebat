import { Skeleton } from "@/components/ui/skeleton";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import React, { useCallback, useLayoutEffect, useState } from "react";
import { useSharedHistoryContext } from "./providers/SharedHistoryContext";

import { mergeRegister } from "@lexical/utils";
import { BLUR_COMMAND, COMMAND_PRIORITY_LOW, FOCUS_COMMAND } from "lexical";
import type { SerializedEditorState } from "lexical";
import { PLUGIN_NAMES } from "./constants";
import { LexicalOnChangePlugin } from "./lexical-on-change";
import HintPlugin from "./nodes/Hint";
import StepperPlugin from "./nodes/Stepper";
import AutoEmbedPlugin from "./plugins/AutoEmbedPlugin";
import LexicalAutoLinkPlugin from "./plugins/AutoLinkPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import CollapsiblePlugin from "./plugins/CollapsiblePlugin";
import DragDropPaste from "./plugins/DragDropPastePlugin";
import DraggableBlockPlugin from "./plugins/DraggableBlockPlugin";
import ImagesPlugin from "./plugins/ImagesPlugin";
import { LayoutPlugin } from "./plugins/LayoutPlugin";
import ShortcutsPlugin from "./plugins/ShortcutsPlugin";
import TabFocusPlugin from "./plugins/TabFocusPlugin";
import TableCellResizerPlugin from "./plugins/TableCellResizer";
import TableOfContentsPlugin from "./plugins/TableOfContentsPlugin";
import YouTubePlugin from "./plugins/YouTubePlugin";
import { useEditorContext } from "./providers/EditorContext";

const ExcalidrawPlugin = dynamic(() => import("./plugins/ExcalidrawPlugin"), {
	ssr: false,
});
const SlashCommand = dynamic(() => import("./plugins/SlashCommand"), {
	ssr: false,
});
const ToolbarPlugin = dynamic(() => import("./plugins/ToolbarPlugin"), {
	ssr: false,
	loading: () => <Skeleton className="w-full mt-8 h-9" />,
});
const FloatingLinkEditorPlugin = dynamic(
	() => import("./plugins/FloatingLinkEditorPlugin"),
	{ ssr: false },
);
const TableCellActionMenuPlugin = dynamic(
	() => import("./plugins/TableCellActionMenuPlugin"),
	{ ssr: false },
);
const TableHoverActionsPlugin = dynamic(
	() => import("./plugins/TableHoverActionsPlugin"),
	{ ssr: false },
);
const CodeActionMenuPlugin = dynamic(
	() => import("./plugins/CodeActionMenuPlugin"),
	{ ssr: false },
);
const FloatingTextFormatToolbarPlugin = dynamic(
	() => import("./plugins/FloatingTextFormatToolbarPlugin"),
	{ ssr: false },
);

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
	const { historyState } = useSharedHistoryContext();
	const isEditable = useLexicalEditable();
	const [floatingAnchorElem, setFloatingAnchorElem] =
		useState<HTMLDivElement | null>(null);
	const [editor] = useLexicalComposerContext();
	const { pluginConfig, minHeight, setEditor } = useEditorContext(); // Access setEditor from context

	const [activeEditor, setActiveEditor] = useState(editor);
	const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);
	const [hasFocus, setHasFocus] = useState(() => {
		return editor.getRootElement() === document.activeElement;
	});
	const [isHovering, setIsHovering] = useState(false); // Track hover state

	// Set the editor instance in the context
	useLayoutEffect(() => {
		setEditor(editor); // Set the editor instance in the context
	}, [editor, setEditor]);

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

	const onRef = useCallback((_floatingAnchorElem: HTMLDivElement) => {
		if (_floatingAnchorElem !== null) {
			setFloatingAnchorElem(_floatingAnchorElem);
		}
	}, []);

	return (
		<div className="relative flex editor">
			<div
				onMouseEnter={() => setIsHovering(true)}
				onMouseLeave={() => setIsHovering(false)}
				className="flex-1"
			>
				<motion.div
					initial={false}
					animate={{
						opacity: isEditable && (hasFocus || isHovering) ? 1 : 0,
						y: isEditable && (hasFocus || isHovering) ? 0 : -10,
						pointerEvents:
							isEditable && (hasFocus || isHovering) ? "auto" : "none",
					}}
					transition={{ duration: 0.3 }}
					className="fixed top-0 left-0 z-50 "
				>
					<ToolbarPlugin
						editor={editor}
						activeEditor={activeEditor}
						setActiveEditor={setActiveEditor}
						setIsLinkEditMode={setIsLinkEditMode}
					/>
				</motion.div>

				<RichTextPlugin
					contentEditable={
						<div ref={onRef} className="relative">
							<ContentEditable
								style={{ minHeight }}
								id={id}
								autoFocus={autoFocus}
								className="z-20 p-1 border-0 outline-hidden"
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

				<ClearEditorPlugin />
				<ShortcutsPlugin
					editor={activeEditor}
					setIsLinkEditMode={setIsLinkEditMode}
				/>
				<LexicalOnChangePlugin onChangeHandler={onChangeHandler} />
				<LinkPlugin />
				<HorizontalRulePlugin />
				<TabFocusPlugin />
				<TableCellResizerPlugin />
				<LayoutPlugin />
				<CollapsiblePlugin />
				<CodeHighlightPlugin />
				<DragDropPaste />
				<TabIndentationPlugin maxIndent={7} />
				<LexicalAutoLinkPlugin />
				<ListPlugin />
				<LinkPlugin />
				{pluginConfig[PLUGIN_NAMES.STEPPER].isEnabled && <StepperPlugin />}
				{pluginConfig[PLUGIN_NAMES.CHECK_LIST].isEnabled && <CheckListPlugin />}
				{pluginConfig[PLUGIN_NAMES.IMAGE].isEnabled && <ImagesPlugin />}
				{pluginConfig[PLUGIN_NAMES.HINT].isEnabled && <HintPlugin />}
				{pluginConfig[PLUGIN_NAMES.YOUTUBE].isEnabled && <YouTubePlugin />}
				<HistoryPlugin externalHistoryState={historyState} />
				<MarkdownShortcutPlugin />
				<ClickableLinkPlugin disabled={isEditable} />
				{pluginConfig[PLUGIN_NAMES.EXCALIDRAW].isEnabled && (
					<ExcalidrawPlugin />
				)}
				<TablePlugin
					hasCellMerge={true}
					hasCellBackgroundColor={true}
					hasHorizontalScroll={true}
				/>

				{floatingAnchorElem && isEditable && (
					<>
						<DraggableBlockPlugin anchorElem={floatingAnchorElem} />
						<FloatingLinkEditorPlugin
							anchorElem={floatingAnchorElem}
							isLinkEditMode={isLinkEditMode}
							setIsLinkEditMode={setIsLinkEditMode}
						/>
						<FloatingTextFormatToolbarPlugin
							setIsLinkEditMode={setIsLinkEditMode}
							anchorElem={floatingAnchorElem}
						/>
						<TableCellActionMenuPlugin
							anchorElem={floatingAnchorElem}
							cellMerge={true}
						/>
						<CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
						<TableHoverActionsPlugin anchorElem={floatingAnchorElem} />
					</>
				)}

				{isEditable && pluginConfig[PLUGIN_NAMES.SLASH_COMMAND].isEnabled && (
					<SlashCommand />
				)}
			</div>
			{pluginConfig[PLUGIN_NAMES.TABLE_OF_CONTENTS].isEnabled && (
				<TableOfContentsPlugin />
			)}
		</div>
	);
}
