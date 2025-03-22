import { TableOfContentsEntry } from "@lexical/react/LexicalTableOfContentsPlugin";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface EditorContextType {
  id: string;
  setId: (id: string) => void;
  tableOfContents: Array<TableOfContentsEntry>;
  setTableOfContents: (entries: Array<TableOfContentsEntry>) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [id, setId] = useState<string>("");
  const [tableOfContents, setTableOfContents] = useState<
    Array<TableOfContentsEntry>
  >([]);

  return (
    <EditorContext.Provider
      value={{ id, setId, tableOfContents, setTableOfContents }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = (): EditorContextType => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorContext must be used within an EditorProvider");
  }
  return context;
};
