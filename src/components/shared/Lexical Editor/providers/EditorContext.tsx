import { TableOfContentsEntry } from "@lexical/react/LexicalTableOfContentsPlugin";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { DEFAULT_SETTINGS, INITIAL_SETTINGS } from "../appSettings";
import type { SettingName } from "../appSettings";

interface EditorContextType {
  id: string;
  setId: (id: string) => void;
  tableOfContents: Array<TableOfContentsEntry>;
  setTableOfContents: (entries: Array<TableOfContentsEntry>) => void;
  settings: Record<SettingName, boolean>;
  setOption: (name: SettingName, value: boolean) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [id, setId] = useState<string>("");
  const [tableOfContents, setTableOfContents] = useState<
    Array<TableOfContentsEntry>
  >([]);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);

  const setOption = useCallback((setting: SettingName, value: boolean) => {
    setSettings((options) => ({
      ...options,
      [setting]: value,
    }));
  }, []);

  const contextValue = useMemo(() => {
    return {
      id,
      setId,
      tableOfContents,
      setTableOfContents,
      settings,
      setOption,
    };
  }, [id, tableOfContents, settings, setOption]);

  return (
    <EditorContext.Provider value={contextValue}>
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
