import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	SerializedLexicalNode,
	SerializedEditor,
	Spread,
	DecoratorNode,
	NodeKey,
	LexicalNode,
	createEditor,
	LexicalCommand,
	createCommand,
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_LOW,
	LexicalEditor,
	EditorState,
} from "lexical";
import React, { Suspense, useEffect } from "react";
const StepperComponent = React.lazy(() => import("../../ui/stepper/stepper"));

export interface StepType {
	title: string;
	id: number;
	content: LexicalEditor;
}

export type StepsType = StepType[];

export type SerializedStepper = Spread<
	{
		type: "stepper";
		steps: {
			title: string;
			id: string;
			content: SerializedEditor;
		}[];
	},
	SerializedLexicalNode
>;

export const initialEditorState = {
	root: {
		children: [
			{
				children: [
					{
						detail: 0,
						format: 0,
						mode: "normal",
						style: "",
						text: "type the content here..",
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

export class StepperNode extends DecoratorNode<React.ReactElement> {
	__steps: StepsType;

	constructor(steps: StepsType, key?: NodeKey) {
		super(key);
		this.__steps = steps.map((step) => {
			if (!step.content) {
				const newEditor = createEditor();
				const parsedEditorState = newEditor.parseEditorState(
					JSON.stringify(initialEditorState),
				);
				newEditor.setEditorState(parsedEditorState);
				return { ...step, content: newEditor };
			}
			return step;
		});
	}

	static getType(): string {
		return "stepper";
	}

	addStep(step: Omit<StepType, "content">) {
		const self = this.getWritable();
		const newEditor = createEditor();
		const parsedEditorState = newEditor.parseEditorState(
			JSON.stringify(initialEditorState),
		);
		newEditor.setEditorState(parsedEditorState);
		const newStep: StepType = {
			...step,
			content: newEditor,
		};
		self.__steps.push(newStep);
		return self;
	}

	insertStepAtIndex(step: Omit<StepType, "content">, index: number) {
		if (index < 0 || index > this.__steps.length) {
			throw new Error("Invalid index for inserting step.");
		}
		const self = this.getWritable();
		const newEditor = createEditor();
		const parsedEditorState = newEditor.parseEditorState(
			JSON.stringify(initialEditorState),
		);
		newEditor.setEditorState(parsedEditorState);
		const newStep: StepType = {
			...step,
			content: newEditor,
		};
		self.__steps.splice(index, 0, newStep);
		return self;
	}
	deleteStep(id: number) {
		const self = this.getWritable();
		self.__steps = self.__steps.filter((step) => step.id !== id);
		return self;
	}
	updateTitle(id: number, title: string) {
		const self = this.getWritable();
		const step = self.__steps.find((s) => s.id === id);
		if (step) step.title = title;
		return self;
	}

	replaceSteps(steps: StepsType) {
		const self = this.getWritable();
		self.__steps = steps.map((step) => {
			if (step.content) return step;
			const newEditor = createEditor();
			const parsedEditorState = newEditor.parseEditorState(
				JSON.stringify(initialEditorState),
			);
			newEditor.setEditorState(parsedEditorState);
			return { ...step, content: newEditor };
		});
		return self;
	}

	reorderSteps(newSteps: StepsType) {
		const self = this.getWritable();
		self.__steps = newSteps;
		return self;
	}

	static clone(node: StepperNode): StepperNode {
		return new StepperNode(node.__steps, node.__key);
	}

	static importJSON(serializedNode: SerializedStepper): StepperNode {
		const steps: StepType[] = serializedNode.steps.map((serializedStep) => {
			const newEditor = createEditor();
			const editorState = newEditor.parseEditorState(
				serializedStep.content.editorState,
			);
			newEditor.setEditorState(editorState);
			return {
				title: serializedStep.title,
				id: parseInt(serializedStep.id, 10),
				content: newEditor,
			};
		});
		return new StepperNode(steps);
	}

	exportJSON(): SerializedStepper {
		return {
			...super.exportJSON(),
			steps: this.__steps.map((step) => ({
				title: step.title,
				id: step.id.toString(),
				content: {
					editorState: step.content.getEditorState().toJSON(),
				},
			})),
			type: "stepper",
		};
	}

	createDOM(): HTMLElement {
		const element = document.createElement("div");
		element.className = `stepper-${this.__type}`;
		return element;
	}

	updateDOM(): false {
		return false;
	}

	decorate(): React.ReactElement {
		return (
			<Suspense fallback={null}>
				<div>
					<StepperComponent steps={this.__steps} nodeKey={this.getKey()} />
				</div>
			</Suspense>
		);
	}
}

export function $isStepperNode(
	node: LexicalNode | null | undefined,
): node is StepperNode {
	return node instanceof StepperNode;
}

export function $createStepperNode(steps: StepsType): StepperNode {
	return new StepperNode(steps);
}

export const INSERT_STEPPER_COMMAND: LexicalCommand<StepsType> =
	createCommand();

export function $insertStepperNode(steps: StepsType) {
	const selection = $getSelection();
	if ($isRangeSelection(selection)) {
		const stepperNode = $createStepperNode(steps);
		selection.insertNodes([stepperNode]);
	}
}

export default function StepperPlugin() {
	const [editor] = useLexicalComposerContext();
	useEffect(() => {
		if (!editor.hasNodes([StepperNode])) {
			throw new Error("StepperNode: StepperNode not registered on editor");
		}
	}, [editor]);
	useEffect(() => {
		return editor.registerCommand(
			INSERT_STEPPER_COMMAND,
			(payload: StepsType) => {
				editor.update(() => {
					$insertStepperNode(payload);
				});
				return true;
			},
			COMMAND_PRIORITY_LOW,
		);
	}, [editor]);

	return null;
}
