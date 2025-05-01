import { $generateHtmlFromNodes } from "@lexical/html";
import {
	DecoratorNode,
	DOMExportOutput,
	LexicalEditor,
	LexicalNode,
	NodeKey,
	SerializedLexicalNode,
	Spread,
} from "lexical";
import { createEditor } from "lexical";

export type SerializedYouTubeNode = Spread<
	{
		videoID: string;
		type: "youtube";
		version: 1;
	},
	SerializedLexicalNode
>;

export class YouTubeNode extends DecoratorNode<React.ReactNode> {
	__videoID: string;

	static getType(): string {
		return "youtube";
	}

	static clone(node: YouTubeNode): YouTubeNode {
		return new YouTubeNode(node.__videoID, node.__key);
	}

	constructor(videoID: string, key?: NodeKey) {
		super(key);
		this.__videoID = videoID;
	}

	decorate(): React.ReactNode {
		return null; // Will be implemented by React plugin
	}

	exportDOM(): DOMExportOutput {
		const container = document.createElement("div");
		container.setAttribute("data-lexical-decorator", "true");
		container.setAttribute("contenteditable", "false");

		const embedContainer = document.createElement("div");
		embedContainer.className = "PlaygroundEditorTheme__embedBlock";
		embedContainer.style.cssText = `
      position: relative;
      width: 100%;
      padding-bottom: 56.25%; /* 16:9 aspect ratio */
      overflow: hidden;
      max-width: 800px; /* More reasonable maximum width */
      margin: 0 auto; /* Center the container */
    `;

		const iframe = document.createElement("iframe");
		// Set reasonable maximum dimensions (matches our max-width)
		iframe.setAttribute("width", "800");
		iframe.setAttribute("height", "450"); // 800 / 16 * 9 = 450
		iframe.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 0;
    `;
		iframe.setAttribute(
			"src",
			`https://www.youtube-nocookie.com/embed/${this.__videoID}`,
		);
		iframe.setAttribute(
			"allow",
			"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
		);
		iframe.setAttribute("allowfullscreen", "");
		iframe.setAttribute("title", "YouTube video");

		embedContainer.appendChild(iframe);
		container.appendChild(embedContainer);

		return { element: container };
	}

	exportJSON(): SerializedYouTubeNode {
		return {
			videoID: this.__videoID,
			type: "youtube",
			version: 1,
		};
	}

	static importJSON(serializedNode: SerializedYouTubeNode): YouTubeNode {
		return new YouTubeNode(serializedNode.videoID);
	}

	createDOM(): HTMLElement {
		const element = document.createElement("div");
		element.setAttribute("data-lexical-youtube", this.__videoID);
		return element;
	}

	updateDOM(): false {
		return false;
	}

	getVideoID(): string {
		return this.__videoID;
	}

	setVideoID(videoID: string): void {
		const self = this.getWritable();
		self.__videoID = videoID;
	}
}

export function $createYouTubeNode(videoID: string): YouTubeNode {
	return new YouTubeNode(videoID);
}

export function $isYouTubeNode(
	node: LexicalNode | null | undefined,
): node is YouTubeNode {
	return node instanceof YouTubeNode;
}
