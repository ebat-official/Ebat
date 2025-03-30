import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_LOW,
	createCommand,
	EditorConfig,
	ElementNode,
	LexicalEditor,
	LexicalNode,
	NodeKey,
} from "lexical";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import { useEffect } from "react";

// Utility function to fetch metadata from a URL
async function fetchMetadata(url: string) {
	try {
		const proxyUrl = "https://api.allorigins.win/get?url=";
		const response = await fetch(`${proxyUrl}${encodeURIComponent(url)}`);
		const data = await response.json();

		// Extract the HTML content from the proxy response
		const html = data.contents;

		// Parse the HTML using DOMParser
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, "text/html");

		// Helper function to extract meta tag content
		const getMetaTagContent = (property: string) => {
			const element =
				doc.querySelector(`meta[property="${property}"]`) ||
				doc.querySelector(`meta[name="${property}"]`);
			return element ? element.getAttribute("content") : null;
		};

		// Extract metadata
		const metadata = {
			title:
				doc.querySelector("title")?.textContent ||
				getMetaTagContent("og:title") ||
				"No title",
			description:
				getMetaTagContent("og:description") ||
				getMetaTagContent("description") ||
				"No description",
			image: getMetaTagContent("og:image") || undefined, // Use a valid fallback image URL
			website: getMetaTagContent("og:site_name") || new URL(url).hostname, // Use hostname as fallback
		};

		return metadata;
	} catch (error) {
		return {
			title: "No title",
			description: "No description",
			image: undefined,
			website: new URL(url).hostname,
		};
	}
}

export class LinkWithMetaDataNode extends ElementNode {
	__url: string | null;
	__metadata: {
		title: string;
		description: string;
		image?: string | undefined | null;
		website: string;
	} | null = null;
	__editor: LexicalEditor;

	constructor(url: string | null, editor: LexicalEditor, key?: NodeKey) {
		super(key);
		this.__url = url;
		this.__editor = editor; // Store the editor instance
	}

	static clone(node: LinkWithMetaDataNode): LinkWithMetaDataNode {
		return new LinkWithMetaDataNode(node.__url, node.__editor, node.__key);
	}
	static importJSON(serializedNode: any): LinkWithMetaDataNode {
		const node = $createLinkNode(serializedNode.url, serializedNode.__editor);
		node.__metadata = serializedNode.metadata;
		node.__url = serializedNode.url;

		return node;
	}
	exportJSON() {
		return {
			...super.exportJSON(),
			url: this.__url,
			metadata: this.__metadata,
			type: "link-with-metadata",
			version: 1,
		};
	}

	static getType(): string {
		return "link-with-metadata";
	}

	// Method to update metadata
	setMetadata(metadata: {
		title: string;
		description: string;
		image?: string;
		website: string;
	}) {
		const writable = this.getWritable();
		writable.__metadata = metadata;
	}

	createDOM(): HTMLElement {
		const elementDIV = document.createElement("div");
		elementDIV.className =
			"dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 border border-zinc-200 bg-white/90   text-zinc-950 shadow-md  w-full  cursor-pointer p-3 rounded-sm border flex flex-row items-center justify-between";
		elementDIV.setAttribute("contenteditable", "false");

		// Create a container for the left and right sections
		const container = document.createElement("div");
		container.className =
			"flex flex-row w-full max-sm:flex-col max-sm:gap-y-2 justify-between items-start gap-x-2";

		// Conditionally create the left container for the image
		if (this.__metadata?.image) {
			const leftContainer = document.createElement("div");
			leftContainer.className =
				"flex  w-full h-full max-w-[250px]  max-h-[100px] min-h-[100px] order-6";

			// Create the image element
			const image = document.createElement("img");
			image.src = this.__metadata.image;
			image.alt = `image for ${this.__metadata.title}`;
			image.className = "w-full h-[100px] rounded-lg object-cover";
			leftContainer.appendChild(image);

			// Append the left container to the main container
			container.appendChild(leftContainer);
		}

		// Right container for the text content
		const rightContainer = document.createElement("div");
		rightContainer.className =
			"flex flex-col flex-1 w-full flex-wrap items-start space-y-4";

		// Create the title as a clickable link
		const titleLink = document.createElement("a");
		titleLink.className = "font-bold break-words hover:underline";
		titleLink.href = this.__url || "#"; // Use the URL or a fallback
		titleLink.textContent = this.__url || "No URL provided";
		titleLink.target = "_blank"; // Open link in a new tab
		rightContainer.appendChild(titleLink);

		// Create the description small element
		const descriptionSmall = document.createElement("small");
		descriptionSmall.className = "font-[400] dark:text-gray-200 text-gray-500";
		descriptionSmall.textContent =
			this.__metadata?.description || "Loading metadata...";
		rightContainer.appendChild(descriptionSmall);

		// Create the source small element
		const sourceSmall = document.createElement("small");
		sourceSmall.className =
			"text-sm mt-4 font-[400] dark:text-gray-300 text-gray-500/50";
		sourceSmall.textContent = this.__metadata?.website || "";
		rightContainer.appendChild(sourceSmall);

		// Append the right container to the main container
		container.appendChild(rightContainer);

		// Append the main container to the root div
		elementDIV.appendChild(container);

		// Fetch metadata and update the node
		if (this.__url && !this.__metadata) {
			fetchMetadata(this.__url)
				.then((metadata) => {
					// Use editor.update() to perform state updates
					this.__editor.update(() => {
						this.setMetadata(metadata);
					});
				})
				.catch((error) => {
					console.error("Error fetching metadata:", error);
				});
		}

		return elementDIV;
	}

	updateDOM(prevNode: LinkWithMetaDataNode, dom: HTMLElement): boolean {
		// Check if metadata has changed
		if (this.__metadata !== prevNode.__metadata) {
			const container = dom.querySelector("div");
			const image = dom.querySelector("img");
			const titleLink = dom.querySelector("a");
			const descriptionSmall = dom.querySelector("small:nth-of-type(1)");
			const sourceSmall = dom.querySelector("small:nth-of-type(2)");

			if (titleLink && descriptionSmall && sourceSmall) {
				titleLink.href = this.__url || "#";
				titleLink.textContent =
					this.__metadata?.title || this.__url || "No URL provided";
				descriptionSmall.textContent =
					this.__metadata?.description || "Loading metadata...";
				sourceSmall.textContent = this.__metadata?.website || "";
			}

			// Handle image updates
			if (this.__metadata?.image) {
				if (!image) {
					const leftContainer = document.createElement("div");
					leftContainer.className = "flex h-full flex-shrink-0 order-6";

					const newImage = document.createElement("img");
					newImage.src = this.__metadata.image;
					newImage.alt = "Custom Image";
					newImage.className =
						"w-24 min-h-24 max-[250px] h-[200px] rounded-lg object-fill";
					leftContainer.appendChild(newImage);

					// Insert the left container before the right container
					container?.insertBefore(leftContainer, container.firstChild);
				} else {
					image.src = this.__metadata.image;
				}
			} else if (image) {
				image.remove();
			}

			return true;
		}

		return false;
	}
}
export function $createLinkNode(
	url: string | null,
	editor: LexicalEditor,
): LinkWithMetaDataNode {
	return new LinkWithMetaDataNode(url, editor);
}

export function $isLinkNode(node: LexicalNode): node is LinkWithMetaDataNode {
	return node instanceof LinkWithMetaDataNode;
}

export const TOGGLE_LINK_COMMAND_LinkWithMetaDataNode = createCommand<
	string | null
>("toggleLink");

export function LinkWithMetaDataPlugin(): null {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		if (!editor.hasNodes([LinkWithMetaDataNode])) {
			throw new Error(
				"LinkWithMetaDataPlugin: LinkWithMetaDataNode not registered on editor",
			);
		}
	}, [editor]);

	editor.registerCommand(
		TOGGLE_LINK_COMMAND_LinkWithMetaDataNode,
		(url: string | null) => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				const linkNode = $createLinkNode(url, editor);
				$insertNodeToNearestRoot(linkNode);
			}
			return true;
		},
		COMMAND_PRIORITY_LOW,
	);

	return null;
}
