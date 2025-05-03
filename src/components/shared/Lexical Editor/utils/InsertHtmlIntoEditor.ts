import {
	$getRoot,
	$getSelection,
	LexicalEditor,
	RangeSelection,
} from "lexical";
import { $generateNodesFromDOM } from "@lexical/html";

/**
 * Replaces the root content of the Lexical editor with nodes generated from an HTML string.
 * @param editor - The LexicalEditor instance.
 * @param htmlString - The HTML string to insert.
 */
export function insertHtmlIntoEditor(
	editor: LexicalEditor,
	htmlString: string,
): void {
	editor.update(() => {
		const parser = new DOMParser();
		const dom = parser.parseFromString(htmlString, "text/html");

		const nodes = $generateNodesFromDOM(editor, dom);

		const root = $getRoot();
		root.clear(); //  Clear all content

		root.select(); // Select the cleared root

		const selection = $getSelection() as RangeSelection;
		selection.insertNodes(nodes); // Insert new content
	});
}
