"use client";
import { TableOfContentsEntry } from "@lexical/react/LexicalTableOfContentsPlugin";
import React, {
	createContext,
	useContext,
	useState,
	ReactNode,
	useCallback,
	useMemo,
} from "react";
import { LexicalEditor, NodeKey } from "lexical"; // Import LexicalEditor type
import { PLUGIN_CONFIG, pluginConfig, PluginConfigured } from "../appSettings";
import { PluginNames } from "../constants";

interface EditorContextType {
	id: string;
	setId: (id: string) => void;
	tableOfContent: Array<TableOfContentsEntry>;
	setTableOfContent: (entries: Array<TableOfContentsEntry>) => void;
	pluginConfig: pluginConfig;
	setPlugin: (plugin: PluginConfigured, options: object) => void;
	minHeight: string;
	setMinHeight: (height: string) => void;
	editor: LexicalEditor | null; // Add editor state
	setEditor: (editor: LexicalEditor) => void; // Add setter for editor
	selectedContentKey: NodeKey | null; // Add selected content key state
	setSelectedContentKey: (key: NodeKey | null) => void; // Add setter for selected content key
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [id, setId] = useState<string>("");
	const [tableOfContent, setTableOfContent] = useState<
		Array<TableOfContentsEntry>
	>([]);
	const [pluginConfig, setPluginConfig] = useState(PLUGIN_CONFIG);
	const [minHeight, setMinHeight] = useState<string>("250px");
	const [editor, setEditor] = useState<LexicalEditor | null>(null); // Add editor state
	const [selectedContentKey, setSelectedContentKey] = useState<NodeKey | null>(
		null,
	);
	const setPlugin = useCallback((plugin: PluginNames, options: object) => {
		setPluginConfig((prev) => ({
			...prev,
			[plugin]: {
				...(prev[plugin as keyof typeof prev] || {}),
				...options,
			},
		}));
	}, []);

	const contextValue = useMemo(() => {
		return {
			id,
			setId,
			tableOfContent,
			setTableOfContent,
			pluginConfig,
			setPlugin,
			minHeight,
			setMinHeight,
			editor,
			setEditor,
			selectedContentKey,
			setSelectedContentKey,
		};
	}, [id, tableOfContent, pluginConfig, setPlugin, minHeight, editor]);

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
