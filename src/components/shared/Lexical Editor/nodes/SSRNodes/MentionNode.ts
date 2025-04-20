import {
	DecoratorNode,
	LexicalNode,
	SerializedLexicalNode,
	Spread,
} from "lexical";

type MentionData = {
	id: string;
	label: string;
};

type SerializedMentionNode = Spread<
	{
		trigger: string;
		value: string;
		data: MentionData;
		type: string;
		version: 1;
	},
	SerializedLexicalNode
>;

export class MentionNode extends DecoratorNode<null> {
	__trigger: string;
	__value: string;
	__data: MentionData;

	static getType(): string {
		return "beautifulMention";
	}

	static clone(node: MentionNode): MentionNode {
		return new MentionNode(
			node.__trigger,
			node.__value,
			node.__data,
			node.__key,
		);
	}

	constructor(trigger: string, value: string, data: MentionData, key?: string) {
		super(key);
		this.__trigger = trigger;
		this.__value = value;
		this.__data = data;
	}

	static importJSON(serializedNode: SerializedMentionNode): MentionNode {
		return new MentionNode(
			serializedNode.trigger,
			serializedNode.value,
			serializedNode.data,
		);
	}

	exportJSON(): SerializedMentionNode {
		return {
			trigger: this.__trigger,
			value: this.__value,
			data: this.__data,
			type: "beautifulMention",
			version: 1,
		};
	}

	createDOM(): HTMLElement {
		const span = document.createElement("span");
		span.textContent = `@${this.__value}`;
		span.style.color = "#2563eb"; // blue-600
		span.style.fontWeight = "500";
		return span;
	}

	exportDOM(): DOMExportOutput {
		const element = document.createElement("span");
		element.textContent = `@${this.__value}`;
		element.setAttribute("data-id", this.__data.id);
		element.setAttribute("style", "color: #2563eb; font-weight: 500;");
		return { element };
	}

	isInline(): boolean {
		return true;
	}

	decorate(): null {
		return null;
	}
}
