import { $isListItemNode } from "@lexical/list";
import { $isHeadingNode, $isQuoteNode } from "@lexical/rich-text";
import { $isParagraphNode, LexicalNode } from "lexical";
export const getNodePlaceholder = (lexicalNode: LexicalNode) => {
	let placeholder;

	if ($isHeadingNode(lexicalNode)) {
		const tag = lexicalNode.getTag();
		placeholder = "Heading";
		switch (tag) {
			case "h1": {
				placeholder += " 1";
				break;
			}
			case "h2": {
				placeholder += " 2";
				break;
			}
			case "h3": {
				placeholder += " 3";
				break;
			}
			case "h4": {
				placeholder += " 4";
				break;
			}
			case "h5": {
				placeholder += "5";
				break;
			}
			case "h6": {
				placeholder += "6";
				break;
			}
		}
	}
	if ($isListItemNode(lexicalNode)) {
		placeholder = "list";
	}
	if ($isQuoteNode(lexicalNode)) {
		placeholder = "Quote";
	}

	if ($isParagraphNode(lexicalNode)) {
		placeholder = "Press '/' for command";
	}

	return placeholder;
};
