import React, { useCallback, useLayoutEffect, useState } from "react";
import { useSharedHistoryContext } from "./providers/SharedHistoryContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { AnimatePresence, motion } from "framer-motion";

import ShortcutsPlugin from "./plugins/ShortcutsPlugin";
import TabFocusPlugin from "./plugins/TabFocusPlugin";
import TableCellResizerPlugin from "./plugins/TableCellResizer";
import ImagesPlugin from "./plugins/ImagesPlugin";
import PollPlugin from "./plugins/PollPlugin";
import { LayoutPlugin } from "./plugins/LayoutPlugin";
import CollapsiblePlugin from "./plugins/CollapsiblePlugin";
import LexicalAutoLinkPlugin from "./plugins/AutoLinkPlugin";
import { LinkWithMetaDataPlugin } from "./plugins/LinkWithMetaData";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import DragDropPaste from "./plugins/DragDropPastePlugin";
import DraggableBlockPlugin from "./plugins/DraggableBlockPlugin";
import TwitterPlugin from "./plugins/TwitterPlugin";
import AutoEmbedPlugin from "./plugins/AutoEmbedPlugin";
import YouTubePlugin from "./plugins/YouTubePlugin";
import HintPlugin from "./nodes/Hint";
import { LexicalOnChangePlugin } from "./lexical-on-change";
import StepperPlugin from "./nodes/Stepper";
import TableOfContentsPlugin from "./plugins/TableOfContentsPlugin";
import { useEditorContext } from "./providers/EditorContext";
import { PLUGIN_NAMES } from "./constants";
import { mergeRegister } from "@lexical/utils";
import {
  BLUR_COMMAND,
  COMMAND_PRIORITY_LOW,
  FOCUS_COMMAND,
  SerializedEditorState,
} from "lexical";

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
  { ssr: false }
);
const TableCellActionMenuPlugin = dynamic(
  () => import("./plugins/TableCellActionMenuPlugin"),
  { ssr: false }
);
const TableHoverActionsPlugin = dynamic(
  () => import("./plugins/TableHoverActionsPlugin"),
  { ssr: false }
);
const CodeActionMenuPlugin = dynamic(
  () => import("./plugins/CodeActionMenuPlugin"),
  { ssr: false }
);
const FloatingTextFormatToolbarPlugin = dynamic(
  () => import("./plugins/FloatingTextFormatToolbarPlugin"),
  { ssr: false }
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
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);
  const [hasFocus, setHasFocus] = useState(() => {
    return editor.getRootElement() === document.activeElement;
  });
  const [isHovering, setIsHovering] = useState(false); // Track hover state

  useLayoutEffect(() => {
    setHasFocus(editor.getRootElement() === document.activeElement);
    return mergeRegister(
      editor.registerCommand(
        FOCUS_COMMAND,
        () => {
          setHasFocus(true);
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        BLUR_COMMAND,
        () => {
          setHasFocus(false);
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  const onRef = useCallback((_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  }, []);

  const { pluginConfig, minHeight } = useEditorContext();
  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <AnimatePresence>
        {isEditable && (hasFocus || isHovering) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 z-50"
          >
            <ToolbarPlugin
              editor={editor}
              activeEditor={activeEditor}
              setActiveEditor={setActiveEditor}
              setIsLinkEditMode={setIsLinkEditMode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <RichTextPlugin
        contentEditable={
          <div ref={onRef} className="relative">
            <ContentEditable
              style={{ minHeight }}
              id={id}
              autoFocus={autoFocus}
              className="-z-1 z-20 min p-1 mt-7 outline-none border-0"
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
      {pluginConfig[PLUGIN_NAMES.PARAGRAPH].isEnabled && <PollPlugin />}
      <TableCellResizerPlugin />
      <LayoutPlugin />
      <CollapsiblePlugin />
      <CodeHighlightPlugin />
      <DragDropPaste />
      <TabIndentationPlugin maxIndent={7} />
      <LexicalAutoLinkPlugin />
      <LinkWithMetaDataPlugin />
      <ListPlugin />
      <LinkPlugin />
      {pluginConfig[PLUGIN_NAMES.STEPPER].isEnabled && <StepperPlugin />}
      {pluginConfig[PLUGIN_NAMES.TWITTER].isEnabled && <TwitterPlugin />}
      {pluginConfig[PLUGIN_NAMES.CHECK_LIST].isEnabled && <CheckListPlugin />}
      {pluginConfig[PLUGIN_NAMES.IMAGE].isEnabled && <ImagesPlugin />}
      {pluginConfig[PLUGIN_NAMES.HINT].isEnabled && <HintPlugin />}
      {pluginConfig[PLUGIN_NAMES.YOUTUBE].isEnabled && <YouTubePlugin />}
      <HistoryPlugin externalHistoryState={historyState} />
      <MarkdownShortcutPlugin />
      <ClickableLinkPlugin disabled={isEditable} />
      {pluginConfig[PLUGIN_NAMES.EXCALIDRAW].isEnabled && <ExcalidrawPlugin />}
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
          {pluginConfig[PLUGIN_NAMES.TABLE_OF_CONTENTS].isEnabled && (
            <TableOfContentsPlugin />
          )}
        </>
      )}

      {isEditable && pluginConfig[PLUGIN_NAMES.SLASH_COMMAND].isEnabled && (
        <SlashCommand />
      )}
    </div>
  );
}
