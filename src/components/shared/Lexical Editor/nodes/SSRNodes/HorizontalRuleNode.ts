import {
	DOMExportOutput,
	DecoratorNode,
	LexicalNode,
	NodeKey,
	SerializedLexicalNode,
	Spread,
} from "lexical";

export type SerializedHorizontalRuleNode = Spread<
	{
		type: "horizontalrule";
		version: 1;
	},
	SerializedLexicalNode
>;

export class HorizontalRuleNode extends DecoratorNode<HTMLElement> {
	static getType(): string {
		return "horizontalrule";
	}

	static clone(node: HorizontalRuleNode): HorizontalRuleNode {
		return new HorizontalRuleNode(node.__key);
	}

	constructor(key?: NodeKey) {
		super(key);
	}

	static importJSON(
		serializedNode: SerializedHorizontalRuleNode,
	): HorizontalRuleNode {
		return new HorizontalRuleNode();
	}

	exportJSON(): SerializedHorizontalRuleNode {
		return {
			type: "horizontalrule",
			version: 1,
		};
	}

	createDOM(): HTMLElement {
		const element = document.createElement("hr");
		element.className = "w-full h-1 border-input selected";
		element.setAttribute("data-lexical-decorator", "true");
		element.setAttribute("contenteditable", "false");
		return element;
	}

	updateDOM(): false {
		return false;
	}

	exportDOM(): DOMExportOutput {
		const element = document.createElement("hr");
		element.className = "w-full h-1 border-input selected";
		element.setAttribute("data-lexical-decorator", "true");
		element.setAttribute("contenteditable", "false");
		return { element };
	}

	decorate(): HTMLElement {
		return this.createDOM();
	}
}

export function $createHorizontalRuleNode(): HorizontalRuleNode {
	return new HorizontalRuleNode();
}

export function $isHorizontalRuleNode(
	node: LexicalNode | null | undefined,
): node is HorizontalRuleNode {
	return node instanceof HorizontalRuleNode;
}
