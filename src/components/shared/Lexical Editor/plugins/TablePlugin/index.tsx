import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { invariant } from "framer-motion";
import { EditorThemeClasses, Klass, LexicalEditor, LexicalNode } from "lexical";
import {
	createContext,
	JSX,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

export type InsertTableCommandPayload = Readonly<{
	columns: string;
	rows: string;
	includeHeaders?: boolean;
}>;

export type CellContextShape = {
	cellEditorConfig: null | CellEditorConfig;
	cellEditorPlugins: null | JSX.Element | Array<JSX.Element>;
	set: (
		cellEditorConfig: null | CellEditorConfig,
		cellEditorPlugins: null | JSX.Element | Array<JSX.Element>,
	) => void;
};

export type CellEditorConfig = Readonly<{
	namespace: string;
	nodes?: ReadonlyArray<Klass<LexicalNode>>;
	onError: (error: Error, editor: LexicalEditor) => void;
	readOnly?: boolean;
	theme?: EditorThemeClasses;
}>;

export const CellContext = createContext<CellContextShape>({
	cellEditorConfig: null,
	cellEditorPlugins: null,
	set: () => {
		// Empty
	},
});

export function TableContext({ children }: { children: JSX.Element }) {
	const [contextValue, setContextValue] = useState<{
		cellEditorConfig: null | CellEditorConfig;
		cellEditorPlugins: null | JSX.Element | Array<JSX.Element>;
	}>({
		cellEditorConfig: null,
		cellEditorPlugins: null,
	});
	return (
		<CellContext.Provider
			value={useMemo(
				() => ({
					cellEditorConfig: contextValue.cellEditorConfig,
					cellEditorPlugins: contextValue.cellEditorPlugins,
					set: (cellEditorConfig, cellEditorPlugins) => {
						setContextValue({ cellEditorConfig, cellEditorPlugins });
					},
				}),
				[contextValue.cellEditorConfig, contextValue.cellEditorPlugins],
			)}
		>
			{children}
		</CellContext.Provider>
	);
}

export function TablePlugin({
	cellEditorConfig,
	children,
}: {
	cellEditorConfig: CellEditorConfig;
	children: JSX.Element | Array<JSX.Element>;
}): JSX.Element | null {
	const [editor] = useLexicalComposerContext();
	const cellContext = useContext(CellContext);
	useEffect(() => {
		if (!editor.hasNodes([TableNode, TableRowNode, TableCellNode])) {
			invariant(
				false,
				"TablePlugin: TableNode, TableRowNode, or TableCellNode is not registered on editor",
			);
		}
	}, [editor]);
	useEffect(() => {
		cellContext.set(cellEditorConfig, children);
	}, [cellContext, cellEditorConfig, children]);
	return null;
}
