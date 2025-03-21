"use client";
import { SharedHistoryContext } from "./providers/SharedHistoryContext";
import { ToolbarContext } from "./providers/ToolbarContext";
import { LexicalComposer } from "@lexical/react/LexicalComposer";

import theme from "./themes/editor-theme";
import Core from "./Core";
import nodes from "./nodes";

export default function Editor({
  isEditable = false,
  content,
}: {
  isEditable: boolean;
  content?: unknown;
}) {
  const initialConfig = {
    namespace: "Bloger editor",
    theme,
    // editorState:
    //   typeof content === "string" ? content : JSON.stringify(content),
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
          <Core />
        </ToolbarContext>
      </SharedHistoryContext>
    </LexicalComposer>
  );
}
