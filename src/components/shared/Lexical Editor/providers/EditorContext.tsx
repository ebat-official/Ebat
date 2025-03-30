import { TableOfContentsEntry } from "@lexical/react/LexicalTableOfContentsPlugin";
import React, {
	createContext,
	useContext,
	useState,
	ReactNode,
	useCallback,
	useMemo,
} from "react";
import { PLUGIN_CONFIG, pluginConfig, PluginConfigured } from "../appSettings";

interface EditorContextType {
	id: string;
	setId: (id: string) => void;
	tableOfContents: Array<TableOfContentsEntry>;
	setTableOfContents: (entries: Array<TableOfContentsEntry>) => void;
	pluginConfig: pluginConfig;
	setPlugin: (plugin: PluginConfigured, options: object) => void;
	minHeight: string;
	setMinHeight: (height: string) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [id, setId] = useState<string>("");
	const [tableOfContents, setTableOfContents] = useState<
		Array<TableOfContentsEntry>
	>([]);
	const [pluginConfig, setPluginConfig] = useState(PLUGIN_CONFIG);
	const [minHeight, setMinHeight] = useState<string>("250px");

	const setPlugin = useCallback((plugin: PluginConfigured, options: object) => {
		setPluginConfig((prev) => ({
			...prev,
			[plugin]: {
				...prev[plugin],
				...options,
			},
		}));
	}, []);

	const contextValue = useMemo(() => {
		return {
			id,
			setId,
			tableOfContents,
			setTableOfContents,
			pluginConfig,
			setPlugin,
			minHeight,
			setMinHeight,
		};
	}, [id, tableOfContents, pluginConfig, setPlugin]);

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
