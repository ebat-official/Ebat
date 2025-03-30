"use client";
import { SharedHistoryContext } from "./providers/SharedHistoryContext";
import { ToolbarContext } from "./providers/ToolbarContext";
import { LexicalComposer } from "@lexical/react/LexicalComposer";

import theme from "./themes/editor-theme";
import Core from "./Core";
import nodes from "./nodes";
import { useEditorContext } from "./providers/EditorContext";
import { useEffect } from "react";
import { SerializedEditorState } from "lexical";

interface EditorProps {
  isEditable: boolean;
  content?: unknown;
  namespace?: string;
  placeholder?: string;
  id?: string;
  autoFocus?: boolean;
  onChangeHandler: (data: SerializedEditorState) => void;
}

export default function Editor({
  isEditable = false,
  content,
  placeholder = "",
  id = "ebatEditor",
  autoFocus = false,
  onChangeHandler,
}: EditorProps) {
  const { setId } = useEditorContext();

  useEffect(() => {
    setId(id);
  }, [id]);

  const initialConfig = {
    namespace: id,
    theme,
    editorState:
      typeof content === "string" ? content : JSON.stringify(content),
    nodes: [...nodes],
    onError: (error: Error) => {
      throw error;
    },
    editable: isEditable,
  };
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <ToolbarContext>
          <Core
            placeholder={placeholder}
            id={id}
            autoFocus={autoFocus}
            onChangeHandler={onChangeHandler}
          />
        </ToolbarContext>
      </SharedHistoryContext>
    </LexicalComposer>
  );
}
