import {
	DOMConversionMap,
	ElementNode,
	LexicalNode,
	NodeKey,
	SerializedElementNode,
	Spread,
} from "lexical";

type SerializedCollapsibleContainerNode = Spread<
	{
		type: "collapsible-container";
		version: 1;
	},
	SerializedElementNode
>;

export class CollapsibleContainerNode extends ElementNode {
	__open: boolean;

	constructor(open: boolean, key?: NodeKey) {
		super(key);
		this.__open = open;
	}

	static getType(): string {
		return "collapsible-container";
	}

	static clone(node: CollapsibleContainerNode): CollapsibleContainerNode {
		return new CollapsibleContainerNode(node.__open, node.__key);
	}

	createDOM(): HTMLElement {
		const dom = document.createElement("details");
		dom.classList.add("Collapsible__container");
		dom.open = this.__open;
		return dom;
	}

	updateDOM(
		prevNode: CollapsibleContainerNode,
		dom: HTMLDetailsElement,
	): boolean {
		if (prevNode.__open !== this.__open) {
			dom.open = this.__open;
		}

		return false;
	}

	static importDOM(): DOMConversionMap | null {
		return {};
	}

	static importJSON(): CollapsibleContainerNode {
		const node = $createCollapsibleContainerNode();
		return node;
	}

	exportJSON(): SerializedCollapsibleContainerNode {
		return {
			...super.exportJSON(),
			type: "collapsible-container",
			version: 1,
		};
	}

	setOpen(open: boolean): void {
		const writable = this.getWritable();
		writable.__open = open;
	}

	getOpen(): boolean {
		return this.__open;
	}

	toggleOpen(): void {
		this.setOpen(!this.getOpen());
	}
}

export function $createCollapsibleContainerNode(): CollapsibleContainerNode {
	return new CollapsibleContainerNode(true);
}

export function $isCollapsibleContainerNode(
	node: LexicalNode | null | undefined,
): node is CollapsibleContainerNode {
	return node instanceof CollapsibleContainerNode;
}
