import {
	DecoratorNode,
	DOMConversionMap,
	DOMConversionOutput,
	DOMExportOutput,
	LexicalNode,
	NodeKey,
	SerializedLexicalNode,
	Spread,
} from "lexical";
import * as React from "react";
import { Suspense } from "react";

export type Options = ReadonlyArray<Option>;

export type Option = Readonly<{
	text: string;
	uid: string;
	votes: Array<string>;
}>;

const PollComponent = React.lazy(() => import("../../ui/poll/poll-component"));

function createUID(): string {
	return Math.random()
		.toString(36)
		.replace(/[^a-z]+/g, "")
		.substr(0, 5);
}

export function createPollOption(text = ""): Option {
	return {
		text,
		uid: createUID(),
		votes: [],
	};
}

function cloneOption(
	option: Option,
	text: string,
	votes?: Array<string>,
): Option {
	return {
		text,
		uid: option.uid,
		votes: votes || Array.from(option.votes),
	};
}

export type SerializedPollNode = Spread<
	{
		question: string;
		options: Options;
	},
	SerializedLexicalNode
>;

function $convertPollElement(domNode: HTMLElement): DOMConversionOutput | null {
	const question = domNode.getAttribute("data-lexical-poll-question");
	const options = domNode.getAttribute("data-lexical-poll-options");
	if (question !== null && options !== null) {
		const node = $createPollNode(question, JSON.parse(options));
		return { node };
	}
	return null;
}

export class PollNode extends DecoratorNode<React.JSX.Element> {
	__question: string;
	__options: Options;

	static getType(): string {
		return "poll";
	}

	static clone(node: PollNode): PollNode {
		return new PollNode(node.__question, node.__options, node.__key);
	}

	static importJSON(serializedNode: SerializedPollNode): PollNode {
		return $createPollNode(
			serializedNode.question,
			serializedNode.options,
		).updateFromJSON(serializedNode);
	}

	constructor(question: string, options: Options, key?: NodeKey) {
		super(key);
		this.__question = question;
		this.__options = options;
	}

	exportJSON(): SerializedPollNode {
		return {
			...super.exportJSON(),
			options: this.__options,
			question: this.__question,
		};
	}

	setQuestion(newQuestion: string): void {
		const self = this.getWritable();
		self.__question = newQuestion;
	}

	addOption(option: Option): void {
		const self = this.getWritable();
		const options = Array.from(self.__options);
		options.push(option);
		self.__options = options;
	}

	deleteOption(option: Option): void {
		const self = this.getWritable();
		const options = Array.from(self.__options);
		const index = options.indexOf(option);
		options.splice(index, 1);
		self.__options = options;
	}

	setOptionText(option: Option, text: string): void {
		const self = this.getWritable();
		const clonedOption = cloneOption(option, text);
		const options = Array.from(self.__options);
		const index = options.indexOf(option);
		options[index] = clonedOption;
		self.__options = options;
	}

	toggleVote(option: Option, clientID: string): void {
		const self = this.getWritable();
		const newOptions = self.__options.map((opt) => {
			if (opt.uid === option.uid) {
				const newVotes = opt.votes.includes(clientID)
					? opt.votes.filter((id) => id !== clientID)
					: [...opt.votes, clientID];
				return { ...opt, votes: newVotes };
			}
			return { ...opt };
		});

		self.__options = newOptions;
		this.markDirty();
	}

	static importDOM(): DOMConversionMap | null {
		return {
			span: (domNode: HTMLElement) => {
				if (!domNode.hasAttribute("data-lexical-poll-question")) {
					return null;
				}
				return {
					conversion: $convertPollElement,
					priority: 2,
				};
			},
		};
	}

	exportDOM(): DOMExportOutput {
		const element = document.createElement("span");
		element.setAttribute("data-lexical-poll-question", this.__question);
		element.setAttribute(
			"data-lexical-poll-options",
			JSON.stringify(this.__options),
		);
		return { element };
	}

	createDOM(): HTMLElement {
		const elem = document.createElement("span");
		elem.style.display = "inline-block";
		return elem;
	}

	updateDOM(): false {
		return false;
	}

	decorate(): React.JSX.Element {
		return (
			<Suspense fallback={null}>
				<PollComponent
					question={this.__question}
					options={this.__options}
					nodeKey={this.__key}
				/>
			</Suspense>
		);
	}
}

export function $createPollNode(question: string, options: Options): PollNode {
	return new PollNode(question, options);
}

export function $isPollNode(
	node: LexicalNode | null | undefined,
): node is PollNode {
	return node instanceof PollNode;
}
