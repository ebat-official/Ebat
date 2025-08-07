import { EditorFileUpload } from "@/utils/types";
import { TableOfContentsEntry } from "@lexical/react/LexicalTableOfContentsPlugin";
import {
	$getRoot,
	LexicalEditor,
	NodeKey,
	LexicalNode,
	ElementNode,
} from "lexical";
import {
	$isImageNode,
	ImageNode,
} from "@/components/shared/Lexical Editor/nodes/ImageNode";
import { create } from "zustand";
import {
	PLUGIN_CONFIG,
	PluginConfigured,
	pluginConfig,
} from "@/components/shared/Lexical Editor/appSettings";
import { PluginNames } from "@/components/shared/Lexical Editor/constants";

interface EditorStore {
	// State
	id: string;
	tableOfContent: Array<TableOfContentsEntry>;
	pluginConfig: pluginConfig;
	minHeight: string;
	editor: LexicalEditor | null;
	selectedContentKey: NodeKey | null;

	// Actions
	setId: (id: string) => void;
	setTableOfContent: (entries: Array<TableOfContentsEntry>) => void;
	setPlugin: (plugin: PluginConfigured, options: object) => void;
	setMinHeight: (height: string) => void;
	setEditor: (editor: LexicalEditor) => void;
	setSelectedContentKey: (key: NodeKey | null) => void;
	getImageUrls: () => string[];
}

export const useEditorStore = create<EditorStore>((set, get) => ({
	// Initial state
	id: "",
	tableOfContent: [],
	pluginConfig: PLUGIN_CONFIG,
	minHeight: "250px",
	editor: null,
	selectedContentKey: null,

	// Actions
	setId: (id: string) => set({ id }),

	setTableOfContent: (entries: Array<TableOfContentsEntry>) =>
		set({ tableOfContent: entries }),

	setPlugin: (plugin: PluginNames, options: object) =>
		set((state) => ({
			pluginConfig: {
				...state.pluginConfig,
				[plugin]: {
					...(state.pluginConfig[plugin as keyof typeof state.pluginConfig] ||
						{}),
					...options,
				},
			},
		})),

	setMinHeight: (height: string) => set({ minHeight: height }),

	setEditor: (editor: LexicalEditor) => set({ editor }),

	setSelectedContentKey: (key: NodeKey | null) =>
		set({ selectedContentKey: key }),

	getImageUrls: (): string[] => {
		const { editor } = get();
		const urls: string[] = [];

		if (!editor) {
			return urls;
		}

		editor.read(() => {
			const root = $getRoot();

			const traverse = (node: LexicalNode) => {
				if (node instanceof ElementNode) {
					node.getChildren().forEach(traverse);
				}

				if ($isImageNode(node)) {
					const src = node.getSrc();
					if (src) {
						urls.push(src);
					}
				}
			};

			traverse(root);
		});

		return urls;
	},
}));
