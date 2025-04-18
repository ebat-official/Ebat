import { $getEditor, $nodesOfType, LexicalEditor } from "lexical";
import {
	BeautifulMentionNode,
	CustomBeautifulMentionNode,
} from "lexical-beautiful-mentions";

export function findBeautifulMentionNodes(editorProp?: LexicalEditor) {
	const editor = editorProp ?? $getEditor();
	if (
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		CustomBeautifulMentionNode &&
		editor.hasNodes([CustomBeautifulMentionNode])
	) {
		// eslint-disable-next-line @typescript-eslint/no-deprecated
		return $nodesOfType(CustomBeautifulMentionNode);
	}
	// eslint-disable-next-line @typescript-eslint/no-deprecated
	return $nodesOfType(BeautifulMentionNode);
}
