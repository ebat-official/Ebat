import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_LOW,
	DecoratorNode,
	LexicalCommand,
	LexicalEditor,
	LexicalNode,
	NodeKey,
	SerializedEditor,
	SerializedLexicalNode,
	Spread,
	createCommand,
	createEditor,
} from "lexical";
import React, { Suspense, useEffect } from "react";
const HintComponent = React.lazy(() => import("./HintComponet"));

export type HintType = "success" | "warning" | "info" | "error" | "hint";

export type SerializedHint = Spread<
	{
		type: "hint";
		variant: HintType;
		caption: SerializedEditor;
	},
	SerializedLexicalNode
>;

export class Hint extends DecoratorNode<React.ReactElement> {
	__variant: HintType;
	__caption: LexicalEditor;

	constructor(variant: HintType, caption?: LexicalEditor, key?: NodeKey) {
		super(key);
		this.__variant = variant;
		if (!caption) {
			const initialEditorState = {
				root: {
					children: [
						{
							children: [
								{
									detail: 0,
									format: 0,
									mode: "normal",
									style: "",
									text: " ",
									type: "text",
									version: 1,
								},
							],
							direction: null,
							format: "",
							indent: 0,
							type: "paragraph",
							version: 1,
							textFormat: 0,
							textStyle: "",
						},
					],
					direction: null,
					format: "",
					indent: 0,
					type: "root",
					version: 1,
				},
			};

			const newEditor = createEditor();
			const parsedEditorState = newEditor.parseEditorState(
				JSON.stringify(initialEditorState),
			);
			newEditor.setEditorState(parsedEditorState);

			this.__caption = newEditor;
		} else {
			this.__caption = caption;
		}
	}

	static getType(): string {
		return "hint";
	}

	static clone(node: Hint): Hint {
		return new Hint(node.__variant, node.__caption, node.__key);
	}
	static importJSON(serializedNode: SerializedHint): Hint {
		return new Hint(
			serializedNode.variant, // Change from type to variant
			undefined,
		).updateFromJSON(serializedNode);
	}

	setVariant(variant: HintType) {
		const self = this.getWritable(); // Get mutable instance
		self.__variant = variant;
		return self;
	}

	createDOM(): HTMLElement {
		const element = document.createElement("div");
		element.className = `hint-${this.__type}`;
		return element;
	}

	updateFromJSON(serializedNode: SerializedHint): this {
		super.updateFromJSON(serializedNode);
		const nestedEditor = this.__caption;
		const editorState = nestedEditor.parseEditorState(
			serializedNode.caption.editorState,
		);
		if (!editorState.isEmpty()) {
			nestedEditor.setEditorState(editorState);
		}
		return this;
	}

	exportJSON(): SerializedHint {
		return {
			...super.exportJSON(),
			variant: this.__variant,
			type: "hint",
			caption: this.__caption.toJSON(),
		};
	}

	updateDOM(): false {
		return false;
	}

	decorate(): React.ReactElement {
		return (
			<Suspense fallback={null}>
				<HintComponent
					type={this.__variant}
					captionEditor={this.__caption}
					nodeKey={this.getKey()}
				/>
			</Suspense>
		);
	}
}

export function $isHintNode(
	node: LexicalNode | null | undefined,
): node is Hint {
	return node instanceof Hint;
}

export function $createHintNode(type: HintType): Hint {
	return new Hint(type);
}

export const INSERT_HINT_COMMAND: LexicalCommand<HintType> = createCommand();

export function $insertHintNode(type: HintType) {
	const selection = $getSelection();
	if ($isRangeSelection(selection)) {
		const hintNode = $createHintNode(type);
		selection.insertNodes([hintNode]);
	}
}

export default function HintPlugin() {
	const [editor] = useLexicalComposerContext();
	useEffect(() => {
		if (!editor.hasNodes([Hint])) {
			throw new Error("Hint: Hint not registered on editor");
		}
	}, [editor]);
	useEffect(() => {
		return editor.registerCommand(
			INSERT_HINT_COMMAND,
			(payload: HintType, editor: LexicalEditor) => {
				editor.update(() => {
					$insertHintNode(payload);
				});
				return true;
			},
			COMMAND_PRIORITY_LOW,
		);
	}, [editor]);

	return null;
}
