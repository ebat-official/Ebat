import type {
	DOMConversionMap,
	DOMConversionOutput,
	DOMExportOutput,
	EditorConfig,
	LexicalNode,
	NodeKey,
	SerializedLexicalNode,
	Spread,
} from "lexical";
import { DecoratorNode } from "lexical";
import { createEditor } from "lexical";

export type AlignmentType = "center" | "left" | "right";

export interface ImagePayload {
	altText: string;
	caption?: ReturnType<typeof createEditor>;
	height?: number;
	maxWidth?: number;
	showCaption?: boolean;
	src: string;
	width?: number;
	rounded?: number;
	alignment?: AlignmentType;
}

export type SerializedImageNode = Spread<
	{
		type: "image";
		version: 1;
		altText: string;
		caption: ReturnType<typeof createEditor>;
		height?: number;
		maxWidth: number;
		showCaption: boolean;
		src: string;
		width?: number;
		rounded?: number;
		alignment: AlignmentType;
	},
	SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<void> {
	__src: string;
	__altText: string;
	__width: number;
	__height: number;
	__maxWidth: number;
	__showCaption: boolean;
	__caption: ReturnType<typeof createEditor>;
	__rounded: number;
	__alignment: AlignmentType;

	static getType(): string {
		return "image";
	}

	static clone(node: ImageNode): ImageNode {
		return new ImageNode(
			node.__src,
			node.__altText,
			node.__maxWidth,
			node.__width,
			node.__height,
			node.__showCaption,
			node.__caption,
			node.__rounded,
			node.__alignment,
			node.__key,
		);
	}

	constructor(
		src: string,
		altText: string,
		maxWidth: number,
		width = 0,
		height = 0,
		showCaption = false,
		caption: ReturnType<typeof createEditor> = createEditor(),
		rounded = 0,
		alignment: AlignmentType = "center",
		key?: NodeKey,
	) {
		super(key);
		this.__src = src;
		this.__altText = altText;
		this.__maxWidth = maxWidth;
		this.__width = width;
		this.__height = height;
		this.__showCaption = showCaption;
		this.__caption = caption;
		this.__rounded = rounded;
		this.__alignment = alignment;
	}

	static importJSON(serializedNode: SerializedImageNode): ImageNode {
		const {
			src,
			altText,
			width,
			height,
			maxWidth,
			showCaption,
			rounded,
			alignment,
		} = serializedNode;
		return new ImageNode(
			src,
			altText,
			maxWidth,
			width,
			height,
			showCaption,
			createEditor(),
			rounded,
			alignment,
		);
	}

	exportJSON(): SerializedImageNode {
		return {
			type: "image",
			version: 1,
			src: this.__src,
			altText: this.__altText,
			width: this.__width,
			height: this.__height,
			maxWidth: this.__maxWidth,
			showCaption: this.__showCaption,
			rounded: this.__rounded,
			alignment: this.__alignment,
			caption: this.__caption,
		};
	}

	createDOM(_config: EditorConfig): HTMLElement {
		const container = document.createElement("div");
		this._renderImage(container);
		return container;
	}

	updateDOM(): boolean {
		return false;
	}

	exportDOM(): DOMExportOutput {
		const container = document.createElement("div");
		this._renderImage(container);
		return { element: container };
	}

	private _renderImage(container: HTMLElement): void {
		container.style.cssText = `
        display: block;
        text-align: ${this.__alignment};
        max-width: ${this.__maxWidth}px;
        margin: 0 auto;
      `;

		const img = document.createElement("img");
		img.src = this.__src;
		img.alt = this.__altText;
		img.loading = "lazy";
		img.decoding = "async";
		img.style.cssText = `
        max-width: 100%;
        height: auto;
        border-radius: ${this.__rounded}px;
        display: block;
		transition: all 0.3s ease;
      `;

		if (this.__width > 0) {
			img.width = this.__width;
		}
		if (this.__height > 0) {
			img.height = this.__height;
		}

		container.appendChild(img);
	}

	static importDOM(): DOMConversionMap | null {
		return {
			img: (node: Node) => {
				const img = node as HTMLImageElement;
				return {
					conversion: $convertImageElement,
					priority: 1,
				};
			},
		};
	}

	getSrc(): string {
		return this.__src;
	}

	getAltText(): string {
		return this.__altText;
	}

	setSrc(src: string): void {
		const writable = this.getWritable();
		writable.__src = src;
	}

	setAltText(altText: string): void {
		const writable = this.getWritable();
		writable.__altText = altText;
	}

	decorate(): void {
		return;
	}

	// Special method for generateHtmlFromNodes
	exportHTML(): string {
		const container = document.createElement("div");
		this._renderImage(container);
		return container.outerHTML;
	}
}

function $convertImageElement(domNode: Node): DOMConversionOutput | null {
	const img = domNode as HTMLImageElement;
	return {
		node: $createImageNode({
			src: img.src,
			altText: img.alt,
			width: img.width,
			height: img.height,
		}),
	};
}

export function $createImageNode(payload: ImagePayload): ImageNode {
	return new ImageNode(
		payload.src,
		payload.altText,
		payload.maxWidth || 900,
		payload.width,
		payload.height,
		payload.showCaption,
		payload.caption || createEditor(),
		payload.rounded || 0,
		payload.alignment || "center",
	);
}

export function $isImageNode(
	node: LexicalNode | null | undefined,
): node is ImageNode {
	return node instanceof ImageNode;
}
