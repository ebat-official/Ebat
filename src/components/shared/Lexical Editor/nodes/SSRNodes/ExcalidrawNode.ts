// import {
// 	DecoratorNode,
// 	DOMExportOutput,
// 	LexicalNode,
// 	NodeKey,
// 	SerializedLexicalNode,
// 	Spread,
// } from "lexical";
// import { excalidrawToSvg } from "../../utils/SSR/excalidrawToSvg";

// export type SerializedExcalidrawNode = Spread<
// 	{
// 		type: "excalidraw";
// 		version: 1;
// 		data: string; // JSON string of { elements, appState }
// 	},
// 	SerializedLexicalNode
// >;

// export class ExcalidrawNode extends DecoratorNode<React.ReactNode> {
// 	__data: string;

// 	static getType(): string {
// 		return "excalidraw";
// 	}

// 	static clone(node: ExcalidrawNode): ExcalidrawNode {
// 		return new ExcalidrawNode(node.__data, node.__key);
// 	}

// 	constructor(data: string, key?: NodeKey) {
// 		super(key);
// 		this.__data = data;
// 	}

// 	exportJSON(): SerializedExcalidrawNode {
// 		return {
// 			type: "excalidraw",
// 			version: 1,
// 			data: this.__data,
// 		};
// 	}

// 	static importJSON(json: SerializedExcalidrawNode): ExcalidrawNode {
// 		return new ExcalidrawNode(json.data);
// 	}

// 	createDOM(): HTMLElement {
// 		const div = document.createElement("div");
// 		div.className = "excalidraw-node";
// 		return div;
// 	}

// 	updateDOM(): false {
// 		return false;
// 	}

// 	decorate(): React.ReactNode {
// 		return null; // handled in React component
// 	}

// 	async exportDOM(): Promise<DOMExportOutput> {
// 		const container = document.createElement("div");

// 		try {
// 			const { elements, appState } = JSON.parse(this.__data);

// 			// Await SVG generation asynchronously
// 			const svg = await excalidrawToSvg({
// 				elements,
// 				appState,
// 				files: null,
// 			});

// 			container.appendChild(svg);
// 		} catch (e) {
// 			console.error("Error parsing Excalidraw data", e);
// 			container.innerHTML = "<p>Invalid Excalidraw data</p>";
// 		}

// 		// Return the Promise resolved with the container
// 		return { element: container };
// 	}
// }

// export function $createExcalidrawNode(data: string): ExcalidrawNode {
// 	return new ExcalidrawNode(data);
// }

// export function $isExcalidrawNode(
// 	node: LexicalNode | null | undefined,
// ): node is ExcalidrawNode {
// 	return node instanceof ExcalidrawNode;
// }
