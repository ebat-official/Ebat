import type {
	DOMConversionMap,
	DOMConversionOutput,
	DOMExportOutput,
	EditorConfig,
	LexicalEditor,
	LexicalNode,
	LexicalUpdateJSON,
	NodeKey,
	SerializedEditor,
	SerializedLexicalNode,
	Spread,
} from "lexical";
import type { JSX } from "react";

import { $applyNodeReplacement, createEditor, DecoratorNode } from "lexical";
import * as React from "react";
import { Suspense } from "react";

const ImageComponent = React.lazy(() => import("../../ui/image"));
export type alignmentType =
	| "center"
	| "left"
	| "right"
	| "bottom"
	| "end"
	| "start";

export interface ImagePayload {
	altText: string;
	caption?: LexicalEditor;
	height?: number;
	key?: NodeKey;
	maxWidth?: number;
	showCaption?: boolean;
	src: string;
	captionsEnabled?: boolean;
	alignment?: alignmentType;
	width?: number;
	rounded?: number;
}

function isGoogleDocCheckboxImg(img: HTMLImageElement): boolean {
	return (
		img.parentElement != null &&
		img.parentElement.tagName === "LI" &&
		img.previousSibling === null &&
		img.getAttribute("aria-roledescription") === "checkbox"
	);
}

function $convertImageElement(domNode: Node): null | DOMConversionOutput {
	const img = domNode as HTMLImageElement;
	if (img.src.startsWith("file:///") || isGoogleDocCheckboxImg(img)) {
		return null;
	}
	const { alt: altText, src, width, height } = img;
	const node = $createImageNode({
		altText,
		height,
		src,
		width,
		alignment: "center",
		rounded: 0,
	});
	return { node };
}

export type SerializedImageNode = Spread<
	{
		altText: string;
		caption: SerializedEditor;
		height?: number;
		maxWidth: number;
		showCaption: boolean;
		src: string;
		rounded?: number;
		alignment: alignmentType;
		width?: number;
	},
	SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
	__src: string;
	__altText: string;
	__width: "inherit" | number;
	__height: "inherit" | number;
	__maxWidth: number;
	__showCaption: boolean;
	__caption: LexicalEditor;
	__captionsEnabled: boolean;
	__rounded: number;
	__alignment: alignmentType;

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
			node.__captionsEnabled,
			node.__key,
			node.__rounded,
			node.__alignment,
		);
	}

	static importJSON(serializedNode: SerializedImageNode): ImageNode {
		const {
			altText,
			height,
			width,
			maxWidth,
			src,
			showCaption,
			alignment,
			rounded,
		} = serializedNode;
		return $createImageNode({
			altText,
			height,
			maxWidth,
			showCaption,
			src,
			width,
			rounded,
			alignment,
		}).updateFromJSON(serializedNode);
	}
	setAlignment(newAlignment: alignmentType) {
		const writable = this.getWritable();
		writable.__alignment = newAlignment;
	}
	getWidth(): number | "inherit" {
		return this.__width;
	}
	getHeight(): number | "inherit" {
		return this.__height;
	}
	setRounded(rounded: number): void {
		const writable = this.getWritable();
		writable.__rounded = rounded;
	}
	updateFromJSON(serializedNode: LexicalUpdateJSON<SerializedImageNode>): this {
		const node = super.updateFromJSON(serializedNode);
		const { caption } = serializedNode;

		const nestedEditor = node.__caption;
		const editorState = nestedEditor.parseEditorState(caption.editorState);
		if (!editorState.isEmpty()) {
			nestedEditor.setEditorState(editorState);
		}
		return node;
	}

	exportDOM(): DOMExportOutput {
		const element = document.createElement("img");
		element.setAttribute("src", this.__src);
		element.setAttribute("alt", this.__altText);
		element.setAttribute("width", this.__width.toString());
		element.setAttribute("height", this.__height.toString());
		return { element };
	}

	static importDOM(): DOMConversionMap | null {
		return {
			img: () => ({
				conversion: $convertImageElement,
				priority: 0,
			}),
		};
	}
	setSrc(src: string) {
		const self = this.getWritable();
		self.__src = src;
	}

	constructor(
		src: string,
		altText: string,
		maxWidth: number,
		width?: "inherit" | number,
		height?: "inherit" | number,
		showCaption?: boolean,
		caption?: LexicalEditor,
		captionsEnabled?: boolean,
		key?: NodeKey,
		rounded: number = 0,
		alignment: alignmentType = "center",
	) {
		super(key);
		this.__src = src;
		this.__altText = altText;
		this.__maxWidth = maxWidth;
		this.__width = width || "inherit";
		this.__height = height || "inherit";
		this.__showCaption = showCaption || false;
		this.__alignment = alignment;
		this.__rounded = rounded;
		this.__caption =
			caption ||
			createEditor({
				nodes: [],
			});
		this.__captionsEnabled = captionsEnabled || captionsEnabled === undefined;
	}

	exportJSON(): SerializedImageNode {
		return {
			...super.exportJSON(),
			altText: this.getAltText(),
			caption: this.__caption.toJSON(),
			height: this.__height === "inherit" ? 0 : this.__height,
			maxWidth: this.__maxWidth,
			showCaption: this.__showCaption,
			rounded: this.__rounded,
			alignment: this.__alignment,
			src: this.getSrc(),
			width: this.__width === "inherit" ? 0 : this.__width,
		};
	}

	setWidthAndHeight(
		width: "inherit" | number,
		height: "inherit" | number,
	): void {
		const writable = this.getWritable();
		writable.__width = width;
		writable.__height = height;
	}

	setShowCaption(showCaption: boolean): void {
		const writable = this.getWritable();
		writable.__showCaption = showCaption;
	}

	createDOM(config: EditorConfig): HTMLElement {
		const span = document.createElement("span");
		const theme = config.theme;
		const className = theme.image;
		if (className !== undefined) {
			span.className = className;
		}
		return span;
	}

	updateDOM(): false {
		return false;
	}

	getSrc(): string {
		return this.__src;
	}

	getAltText(): string {
		return this.__altText;
	}

	decorate(): JSX.Element {
		return (
			<Suspense fallback={null}>
				<div
					style={{
						textAlign: this.__alignment as React.CSSProperties["textAlign"],
					}}
				>
					<ImageComponent
						src={this.__src}
						altText={this.__altText}
						width={this.__width}
						height={this.__height}
						maxWidth={this.__maxWidth}
						nodeKey={this.getKey()}
						showCaption={this.__showCaption}
						caption={this.__caption}
						captionsEnabled={this.__captionsEnabled}
						resizable={true}
						rounded={this.__rounded}
					/>
				</div>
			</Suspense>
		);
	}
}

export function $createImageNode({
	altText,
	height,
	maxWidth = 500,
	captionsEnabled,
	src,
	width,
	showCaption,
	caption,
	key,
	rounded,
	alignment,
}: ImagePayload): ImageNode {
	return $applyNodeReplacement(
		new ImageNode(
			src,
			altText,
			maxWidth,
			width,
			height,
			showCaption,
			caption,
			captionsEnabled,
			key,
			rounded,
			alignment,
		),
	);
}

export function $isImageNode(
	node: LexicalNode | null | undefined,
): node is ImageNode {
	return node instanceof ImageNode;
}
