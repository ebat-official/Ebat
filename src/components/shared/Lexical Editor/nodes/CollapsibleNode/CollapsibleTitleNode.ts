import {
	$createParagraphNode,
	$isElementNode,
	DOMConversionMap,
	ElementNode,
	LexicalNode,
	RangeSelection,
	SerializedElementNode,
	Spread,
} from "lexical";

import { $isCollapsibleContainerNode } from "./CollapsibleContainerNode";
import { $isCollapsibleContentNode } from "./CollapsibleContentNode";

type SerializedCollapsibleTitleNode = Spread<
	{
		type: "collapsible-title";
		version: 1;
	},
	SerializedElementNode
>;

export class CollapsibleTitleNode extends ElementNode {
	static getType(): string {
		return "collapsible-title";
	}

	static clone(node: CollapsibleTitleNode): CollapsibleTitleNode {
		return new CollapsibleTitleNode(node.__key);
	}

	createDOM(): HTMLElement {
		const dom = document.createElement("summary");
		dom.classList.add("Collapsible__title");
		return dom;
	}

	updateDOM(): boolean {
		return false;
	}

	static importDOM(): DOMConversionMap | null {
		return {};
	}

	static importJSON(): CollapsibleTitleNode {
		return $createCollapsibleTitleNode();
	}

	exportJSON(): SerializedCollapsibleTitleNode {
		return {
			...super.exportJSON(),
			type: "collapsible-title",
			version: 1,
		};
	}

	collapseAtStart(_selection: RangeSelection): boolean {
		this.getParentOrThrow().insertBefore(this);
		return true;
	}

	insertNewAfter(): ElementNode {
		const containerNode = this.getParentOrThrow();

		if (!$isCollapsibleContainerNode(containerNode)) {
			throw new Error(
				"CollapsibleTitleNode expects to be child of CollapsibleContainerNode",
			);
		}

		if (containerNode.getOpen()) {
			const contentNode = this.getNextSibling();
			if (!$isCollapsibleContentNode(contentNode)) {
				throw new Error(
					"CollapsibleTitleNode expects to have CollapsibleContentNode sibling",
				);
			}

			const firstChild = contentNode.getFirstChild();
			if ($isElementNode(firstChild)) {
				return firstChild;
			} else {
				const paragraph = $createParagraphNode();
				contentNode.append(paragraph);
				return paragraph;
			}
		} else {
			const paragraph = $createParagraphNode();
			containerNode.insertAfter(paragraph);
			return paragraph;
		}
	}
}

export function $createCollapsibleTitleNode(): CollapsibleTitleNode {
	return new CollapsibleTitleNode();
}

export function $isCollapsibleTitleNode(
	node: LexicalNode | null | undefined,
): node is CollapsibleTitleNode {
	return node instanceof CollapsibleTitleNode;
}
