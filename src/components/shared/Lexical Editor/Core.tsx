import React, { useCallback, useState } from "react";
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
import ImagesPlugin from "./plugins/ImagesPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import ShortcutsPlugin from "./plugins/ShortcutsPlugin";
import TabFocusPlugin from "./plugins/TabFocusPlugin";
import TableCellResizerPlugin from "./plugins/TableCellResizer";
import PollPlugin from "./plugins/PollPlugin";
import { LayoutPlugin } from "./plugins/LayoutPlugin";
import CollapsiblePlugin from "./plugins/CollapsiblePlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import LexicalAutoLinkPlugin from "./plugins/AutoLinkPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkWithMetaDataPlugin } from "./plugins/LinkWithMetaData";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import DragDropPaste from "./plugins/DragDropPastePlugin";
import DraggableBlockPlugin from "./plugins/DraggableBlockPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import TwitterPlugin from "./plugins/TwitterPlugin";
import AutoEmbedPlugin from "./plugins/AutoEmbedPlugin";
import YouTubePlugin from "./plugins/YouTubePlugin";
import HintPlugin from "./nodes/Hint";
import { LexicalOnChangePlugin } from "./lexical-on-change";
import StepperPlugin from "./nodes/Stepper";
import TableOfContentsPlugin from "./plugins/TableOfContentsPlugin";
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
}

export default function Core({ placeholder, id, autoFocus }: CoreProps) {
  const { historyState } = useSharedHistoryContext();
  const isEditable = useLexicalEditable();
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const onRef = useCallback((_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  }, []);

  return (
    <>
      {isEditable && (
        <ToolbarPlugin
          editor={editor}
          activeEditor={activeEditor}
          setActiveEditor={setActiveEditor}
          setIsLinkEditMode={setIsLinkEditMode}
        />
      )}

      <RichTextPlugin
        contentEditable={
          <div ref={onRef} className="relative">
            <ContentEditable
              id={id}
              autoFocus={autoFocus}
              className="-z-1 z-20 h-screen  p-1 mt-[80px] outline-none border-0 "
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

      {/* <AutoFocusPlugin defaultSelection={"rootStart"} /> */}
      <ClearEditorPlugin />
      <ShortcutsPlugin
        editor={activeEditor}
        setIsLinkEditMode={setIsLinkEditMode}
      />
      <LexicalOnChangePlugin />
      <LinkPlugin />
      <HorizontalRulePlugin />
      <TabFocusPlugin />
      <PollPlugin />
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
      <StepperPlugin />
      <TwitterPlugin />
      <CheckListPlugin />
      <ImagesPlugin />
      <AutoEmbedPlugin />
      <HintPlugin />
      <YouTubePlugin />
      <HistoryPlugin externalHistoryState={historyState} />
      <MarkdownShortcutPlugin />
      <ClickableLinkPlugin disabled={isEditable} />
      <ExcalidrawPlugin />
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
          <TableOfContentsPlugin />
        </>
      )}

      {isEditable && <SlashCommand />}
    </>
  );
}
