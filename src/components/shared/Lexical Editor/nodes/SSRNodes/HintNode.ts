import { $generateHtmlFromNodes } from "@lexical/html";
import {
	DOMExportOutput,
	DecoratorNode,
	LexicalEditor,
	LexicalNode,
	NodeKey,
	SerializedEditor,
	SerializedLexicalNode,
	Spread,
} from "lexical";
import { createEditor } from "lexical";

export type HintType = "success" | "warning" | "info" | "error" | "hint";

export type SerializedHintNode = Spread<
	{
		variant: HintType;
		caption: SerializedEditor;
		type: "hint";
		version: 1;
	},
	SerializedLexicalNode
>;

export class HintNode extends DecoratorNode<React.ReactNode> {
	__variant: HintType;
	__caption: LexicalEditor;

	static getType(): string {
		return "hint";
	}

	static clone(node: HintNode): HintNode {
		return new HintNode(node.__variant, node.__caption, node.__key);
	}

	constructor(variant: HintType, caption?: LexicalEditor, key?: NodeKey) {
		super(key);
		this.__variant = variant;
		this.__caption = caption || this.createDefaultEditor();
	}

	private createDefaultEditor(): LexicalEditor {
		const editor = createEditor();
		const initialEditorState = editor.parseEditorState(
			JSON.stringify({
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
						},
					],
					direction: null,
					format: "",
					indent: 0,
					type: "root",
					version: 1,
				},
			}),
		);
		editor.setEditorState(initialEditorState);
		return editor;
	}

	decorate(): React.ReactNode {
		return null; // Will be implemented by React plugin
	}

	exportDOM(): DOMExportOutput {
		const container = document.createElement("div");
		container.style.cssText = `
        margin: 1rem 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      `;

		const hintElement = document.createElement("div");
		hintElement.setAttribute("data-hint-type", this.__variant);
		hintElement.style.cssText = `
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 1rem;
        margin: 0.5rem 0;
        border-radius: 0.5rem;
        width: 100%;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        ${this.getVariantStyles()}
      `;

		const iconContainer = document.createElement("div");
		iconContainer.style.cssText = `
        width: 24px;
        height: 24px;
        margin-right: 12px;
        flex-shrink: 0;
        color: currentColor;
      `;
		iconContainer.innerHTML = this.getHintIcon(this.__variant);
		hintElement.appendChild(iconContainer);

		const captionElement = document.createElement("div");
		captionElement.style.cssText = `
        flex: 1;
        margin-left: 12px;
        font-size: 0.875rem;
        line-height: 1.25rem;
        color: inherit;
      `;

		const captionContent = this.__caption.getEditorState().read(() => {
			return $generateHtmlFromNodes(this.__caption);
		});
		captionElement.innerHTML = captionContent || "<p></p>";
		hintElement.appendChild(captionElement);

		container.appendChild(hintElement);
		return { element: container };
	}

	private getVariantStyles(): string {
		const styles = {
			success: `
          background-color: rgba(74, 222, 128, 0.2);
          border-left: 4px solid rgb(22, 163, 74);
          color: rgb(22, 101, 52);
        `,
			warning: `
          background-color: rgba(250, 204, 21, 0.2);
          border-left: 4px solid rgb(202, 138, 4);
          color: rgb(120, 83, 3);
        `,
			error: `
          background-color: rgba(248, 113, 113, 0.2);
          border-left: 4px solid rgb(220, 38, 38);
          color: rgb(120, 28, 28);
        `,
			info: `
          background-color: rgba(56, 189, 248, 0.2);
          border-left: 4px solid rgb(14, 165, 233);
          color: rgb(12, 84, 120);
        `,
			hint: `
          background-color: rgba(243, 244, 246, 0.5);
          border-left: 4px solid rgb(156, 163, 175);
          color: rgb(31, 41, 55);
        `,
		};
		return styles[this.__variant];
	}

	private getHintIcon(variant: HintType): string {
		const icons = {
			success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd"/></svg>`,
			warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd"/></svg>`,
			error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd"/></svg>`,
			info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd"/></svg>`,
			hint: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd"/></svg>`,
		};
		return icons[variant];
	}

	exportJSON(): SerializedHintNode {
		return {
			variant: this.__variant,
			caption: this.__caption.toJSON(),
			type: "hint",
			version: 1,
		};
	}

	static importJSON(serializedNode: SerializedHintNode): HintNode {
		const node = new HintNode(serializedNode.variant);
		const nestedEditor = node.__caption;
		const editorState = nestedEditor.parseEditorState(
			serializedNode.caption.editorState,
		);
		if (!editorState.isEmpty()) {
			nestedEditor.setEditorState(editorState);
		}
		return node;
	}

	createDOM(): HTMLElement {
		const element = document.createElement("div");
		element.className = `hint hint-${this.__variant}`;
		return element;
	}

	updateDOM(): false {
		return false;
	}

	setVariant(variant: HintType): this {
		const self = this.getWritable();
		self.__variant = variant;
		return self;
	}
}

export function $createHintNode(variant: HintType): HintNode {
	return new HintNode(variant);
}

export function $isHintNode(
	node: LexicalNode | null | undefined,
): node is HintNode {
	return node instanceof HintNode;
}
