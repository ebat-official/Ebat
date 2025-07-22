import {
	DecoratorNode,
	DOMExportOutput,
	LexicalNode,
	NodeKey,
	SerializedLexicalNode,
	Spread,
} from "lexical";
import { createEditor } from "lexical";

export type SerializedExcalidrawNode = Spread<
	{
		type: "excalidraw";
		version: 1;
		data: string; // JSON string of { elements, appState }
	},
	SerializedLexicalNode
>;

export class ExcalidrawNode extends DecoratorNode<React.ReactNode> {
	__data: string;

	static getType(): string {
		return "excalidraw";
	}

	static clone(node: ExcalidrawNode): ExcalidrawNode {
		return new ExcalidrawNode(node.__data, node.__key);
	}

	constructor(data: string, key?: NodeKey) {
		super(key);
		this.__data = data;
	}

	exportJSON(): SerializedExcalidrawNode {
		return {
			type: "excalidraw",
			version: 1,
			data: this.__data,
		};
	}

	static importJSON(json: SerializedExcalidrawNode): ExcalidrawNode {
		return new ExcalidrawNode(json.data);
	}

	createDOM(): HTMLElement {
		const div = document.createElement("div");
		div.className = "excalidraw-node";
		return div;
	}

	updateDOM(): false {
		return false;
	}

	decorate(): React.ReactNode {
		return null; // handled in React component
	}

	exportDOM(): DOMExportOutput {
		const container = document.createElement("div");
		container.setAttribute("data-lexical-decorator", "true");
		container.setAttribute("contenteditable", "false");

		try {
			const { elements, appState } = JSON.parse(this.__data);
			this._renderExcalidraw(container, elements, appState);
		} catch (e) {
			console.error("Error parsing Excalidraw data:", e);
			container.innerHTML =
				'<div class="excalidraw-error">Invalid Excalidraw data</div>';
		}

		return { element: container };
	}

	/**
	 * Renders Excalidraw elements as SVG for SSR
	 * @param container - The container element to render into
	 * @param elements - Array of Excalidraw elements to render
	 * @param appState - Excalidraw app state (theme, background, etc.)
	 */
	private _renderExcalidraw(
		container: HTMLElement,
		elements: unknown[],
		appState: Record<string, unknown>,
	): void {
		// Determine if we're in dark mode from Excalidraw's own settings
		// For SSR, we can't determine the actual theme - it will be handled by CSS
		// The server renders with default colors, client-side CSS will handle theme switching
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const isDarkMode = false; // Always false for SSR - CSS will handle theming

		// CSS handles all theming - no helper function needed

		// Add Tailwind classes for theme support with both light and dark variants
		container.className =
			"excalidraw-container block max-w-4xl mx-auto text-center";
		container.style.cssText = `
			display: block;
			max-width: 800px;
			margin: 0 auto;
			text-align: center;
			background: transparent !important;
			outline: none !important;
			box-shadow: none !important;
		`;

		// Add CSS for client-side theme switching
		const style = document.createElement("style");
		style.textContent = `
			.excalidraw-container {
				--border-color: #e5e7eb;
				--bg-color: transparent;
				--stroke-color: #1e1e1e;
				--arrow-color: #1a1a1a;
				/* Subtle border with 50% opacity */
				border: 1px solid rgba(229, 231, 235, 0.5) !important;
				background: transparent !important;
				outline: none !important;
				box-shadow: none !important;
				border-radius: 8px;
			}
			
			.dark .excalidraw-container {
				--border-color: #374151;
				--bg-color: transparent;
				--stroke-color: #e5e7eb;
				--arrow-color: #ffffff;
				/* Subtle border with 50% opacity for dark mode */
				border: 1px solid rgba(55, 65, 81, 0.5) !important;
				background: transparent !important;
				outline: none !important;
				box-shadow: none !important;
				border-radius: 8px;
			}
			
			.excalidraw-container svg {
				background-color: transparent !important;
				border: none !important;
				outline: none !important;
				box-shadow: none !important;
			}
			
			/* Target all stroke elements except arrows */
			.excalidraw-container svg rect,
			.excalidraw-container svg line:not(.excalidraw-arrow),
			.excalidraw-container svg polygon,
			.excalidraw-container svg ellipse,
			.excalidraw-container svg path,
			.excalidraw-container svg .excalidraw-rect,
			.excalidraw-container svg .excalidraw-line,
			.excalidraw-container svg .excalidraw-ellipse,
			.excalidraw-container svg .excalidraw-diamond,
			.excalidraw-container svg .excalidraw-freedraw {
				stroke: var(--stroke-color) !important;
			}
			
			/* Target all fill elements */
			.excalidraw-container svg text,
			.excalidraw-container svg .excalidraw-text {
				fill: var(--stroke-color) !important;
			}
			
			/* Background elements */
			.excalidraw-container svg .excalidraw-bg {
				fill: var(--bg-color) !important;
			}
			
			/* Arrow-specific styling */
			.excalidraw-container svg .excalidraw-arrow {
				stroke: var(--arrow-color) !important;
			}
			
			/* Arrow marker styling */
			.excalidraw-container svg marker polygon {
				fill: var(--arrow-color) !important;
			}
			
			/* Error styling */
			.excalidraw-error {
				padding: 1rem;
				background: #fef2f2;
				border: 1px solid #fecaca;
				border-radius: 0.5rem;
				color: #dc2626;
				text-align: center;
				font-size: 0.875rem;
			}
			
			.dark .excalidraw-error {
				background: #1f1f1f;
				border-color: #dc2626;
				color: #fca5a5;
			}
		`;
		container.appendChild(style);

		// Calculate bounds for proper viewBox
		const bounds = this._calculateBounds(elements);
		const padding = 20;
		const width = bounds.width + padding * 2;
		const height = bounds.height + padding * 2;

		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("width", "100%");
		svg.setAttribute("height", "400");
		svg.setAttribute(
			"viewBox",
			`${bounds.minX - padding} ${bounds.minY - padding} ${width} ${height}`,
		);
		svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

		// CSS handles all theming - no need for server-side color variables

		// Set basic SVG attributes and let CSS handle the theming
		svg.setAttribute("class", "excalidraw-svg");
		svg.style.cssText = `
			max-width: 100%;
			height: auto;
			background: transparent !important;
			border: none !important;
			outline: none !important;
			box-shadow: none !important;
		`;

		// Set background - make it transparent
		if (
			appState?.viewBackgroundColor &&
			appState.viewBackgroundColor !== "transparent"
		) {
			const background = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"rect",
			);
			background.setAttribute("x", (bounds.minX - padding).toString());
			background.setAttribute("y", (bounds.minY - padding).toString());
			background.setAttribute("width", width.toString());
			background.setAttribute("height", height.toString());
			background.setAttribute("fill", appState.viewBackgroundColor as string);
			background.setAttribute("class", "excalidraw-bg");
			svg.appendChild(background);
		}
		// No background rect for transparent background

		// Add defs for markers and filters
		const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

		// Add arrow marker - CSS will handle theming
		const marker = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"marker",
		);
		marker.setAttribute("id", "arrowhead");
		marker.setAttribute("markerWidth", "12");
		marker.setAttribute("markerHeight", "8");
		marker.setAttribute("refX", "10");
		marker.setAttribute("refY", "4");
		marker.setAttribute("orient", "auto");

		const polygon = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"polygon",
		);
		polygon.setAttribute("points", "0 0, 12 4, 0 8");
		polygon.setAttribute("fill", "var(--arrow-color, #1a1a1a)");
		polygon.setAttribute("class", "arrow-marker");
		marker.appendChild(polygon);
		defs.appendChild(marker);

		// Remove dark mode filter as it might interfere with arrow markers
		// We'll handle colors directly in the element rendering

		svg.appendChild(defs);

		// Render elements as basic shapes
		const validElements = elements.filter(
			(element) =>
				element &&
				typeof element === "object" &&
				!(
					"isDeleted" in element &&
					(element as { isDeleted: boolean }).isDeleted
				),
		);

		for (const element of validElements) {
			const el = element as Record<string, unknown>;
			const type = el.type as string;

			switch (type) {
				case "rectangle": {
					const rect = document.createElementNS(
						"http://www.w3.org/2000/svg",
						"rect",
					);
					rect.setAttribute("x", (el.x as number).toString());
					rect.setAttribute("y", (el.y as number).toString());
					rect.setAttribute("width", (el.width as number).toString());
					rect.setAttribute("height", (el.height as number).toString());
					rect.setAttribute(
						"fill",
						(el.backgroundColor as string) || "transparent",
					);
					rect.setAttribute(
						"stroke",
						(el.strokeColor as string) || "var(--stroke-color, #1e1e1e)",
					);
					rect.setAttribute(
						"stroke-width",
						((el.strokeWidth as number) || 2).toString(),
					);
					rect.setAttribute("class", "excalidraw-rect");

					// Add rounded corners if specified
					if (el.roundness) {
						const roundness = el.roundness as Record<string, unknown>;
						if (roundness.type === 3) {
							rect.setAttribute("rx", "8");
							rect.setAttribute("ry", "8");
						}
					}

					svg.appendChild(rect);
					break;
				}

				case "ellipse": {
					const ellipse = document.createElementNS(
						"http://www.w3.org/2000/svg",
						"ellipse",
					);
					const x = el.x as number;
					const y = el.y as number;
					const width = el.width as number;
					const height = el.height as number;
					ellipse.setAttribute("cx", (x + width / 2).toString());
					ellipse.setAttribute("cy", (y + height / 2).toString());
					ellipse.setAttribute("rx", (width / 2).toString());
					ellipse.setAttribute("ry", (height / 2).toString());
					ellipse.setAttribute(
						"fill",
						(el.backgroundColor as string) || "transparent",
					);
					ellipse.setAttribute(
						"stroke",
						(el.strokeColor as string) || "var(--stroke-color, #1e1e1e)",
					);
					ellipse.setAttribute(
						"stroke-width",
						((el.strokeWidth as number) || 2).toString(),
					);
					ellipse.setAttribute("class", "excalidraw-ellipse");
					svg.appendChild(ellipse);
					break;
				}

				case "diamond": {
					const diamond = document.createElementNS(
						"http://www.w3.org/2000/svg",
						"polygon",
					);
					const x = el.x as number;
					const y = el.y as number;
					const width = el.width as number;
					const height = el.height as number;
					const cx = x + width / 2;
					const cy = y + height / 2;
					const rx = width / 2;
					const ry = height / 2;
					const points = `${cx},${cy - ry} ${cx + rx},${cy} ${cx},${cy + ry} ${cx - rx},${cy}`;
					diamond.setAttribute("points", points);
					diamond.setAttribute(
						"fill",
						(el.backgroundColor as string) || "transparent",
					);
					diamond.setAttribute(
						"stroke",
						(el.strokeColor as string) || "var(--stroke-color, #1e1e1e)",
					);
					diamond.setAttribute(
						"stroke-width",
						((el.strokeWidth as number) || 2).toString(),
					);
					diamond.setAttribute("class", "excalidraw-diamond");
					svg.appendChild(diamond);
					break;
				}

				case "line": {
					const line = document.createElementNS(
						"http://www.w3.org/2000/svg",
						"line",
					);
					const points = el.points as number[][];
					if (points && points.length > 0) {
						// For lines, the points array contains relative coordinates
						// We need to add the base x,y coordinates to get absolute positions
						const baseX = el.x as number;
						const baseY = el.y as number;
						const startX = baseX + points[0][0];
						const startY = baseY + points[0][1];
						const endX = baseX + points[points.length - 1][0];
						const endY = baseY + points[points.length - 1][1];

						line.setAttribute("x1", startX.toString());
						line.setAttribute("y1", startY.toString());
						line.setAttribute("x2", endX.toString());
						line.setAttribute("y2", endY.toString());
						// Use CSS custom property for theme-aware colors
						line.setAttribute(
							"stroke",
							(el.strokeColor as string) || "var(--stroke-color, #1e1e1e)",
						);
						line.setAttribute(
							"stroke-width",
							((el.strokeWidth as number) || 2).toString(),
						);
						line.setAttribute("class", "excalidraw-line");

						// Add arrow markers if specified
						if (el.endArrowhead === "arrow") {
							line.setAttribute("marker-end", "url(#arrowhead)");
						}
						if (el.startArrowhead === "arrow") {
							line.setAttribute("marker-start", "url(#arrowhead)");
						}

						// No filter applied to lines to preserve colors

						svg.appendChild(line);
					}
					break;
				}

				case "arrow": {
					const arrow = document.createElementNS(
						"http://www.w3.org/2000/svg",
						"line",
					);
					const points = el.points as number[][];
					if (points && points.length > 0) {
						// For arrows, the points array contains relative coordinates
						// We need to add the base x,y coordinates to get absolute positions
						const baseX = el.x as number;
						const baseY = el.y as number;
						const startX = baseX + points[0][0];
						const startY = baseY + points[0][1];
						const endX = baseX + points[points.length - 1][0];
						const endY = baseY + points[points.length - 1][1];

						arrow.setAttribute("x1", startX.toString());
						arrow.setAttribute("y1", startY.toString());
						arrow.setAttribute("x2", endX.toString());
						arrow.setAttribute("y2", endY.toString());
						// Use CSS variable for stroke color - will be handled by client-side theming
						const strokeColor =
							(el.strokeColor as string) || "var(--arrow-color, #1a1a1a)";
						arrow.setAttribute("stroke", strokeColor);
						arrow.setAttribute(
							"stroke-width",
							((el.strokeWidth as number) || 2).toString(),
						);
						arrow.setAttribute("class", "excalidraw-arrow");

						// Add arrow marker if specified
						if (el.endArrowhead === "arrow") {
							arrow.setAttribute("marker-end", "url(#arrowhead)");
						}
						if (el.startArrowhead === "arrow") {
							arrow.setAttribute("marker-start", "url(#arrowhead)");
						}

						// No filter applied to arrows to preserve colors

						svg.appendChild(arrow);
					}
					break;
				}

				case "text": {
					const text = document.createElementNS(
						"http://www.w3.org/2000/svg",
						"text",
					);
					text.setAttribute("x", (el.x as number).toString());
					text.setAttribute(
						"y",
						((el.y as number) + (el.height as number)).toString(),
					);
					text.setAttribute(
						"fill",
						(el.strokeColor as string) || "var(--stroke-color, #1e1e1e)",
					);
					text.setAttribute(
						"font-size",
						((el.fontSize as number) || 16).toString(),
					);
					text.setAttribute(
						"font-family",
						(el.fontFamily as string) || "Arial",
					);
					text.setAttribute("text-anchor", "start");
					text.setAttribute("dominant-baseline", "hanging");
					text.setAttribute("class", "excalidraw-text");
					text.textContent = (el.text as string) || "";
					svg.appendChild(text);
					break;
				}

				case "freedraw": {
					const path = document.createElementNS(
						"http://www.w3.org/2000/svg",
						"path",
					);
					const points = el.points as number[][];
					if (points && points.length > 0) {
						let d = `M ${points[0][0]} ${points[0][1]}`;
						for (let i = 1; i < points.length; i++) {
							d += ` L ${points[i][0]} ${points[i][1]}`;
						}
						path.setAttribute("d", d);
						path.setAttribute("fill", "none");
						path.setAttribute(
							"stroke",
							(el.strokeColor as string) || "var(--stroke-color, #1e1e1e)",
						);
						path.setAttribute(
							"stroke-width",
							((el.strokeWidth as number) || 2).toString(),
						);
						path.setAttribute("stroke-linecap", "round");
						path.setAttribute("stroke-linejoin", "round");
						path.setAttribute("class", "excalidraw-freedraw");
						svg.appendChild(path);
					}
					break;
				}
			}
		}

		container.appendChild(svg);
	}

	private _calculateBounds(elements: unknown[]): {
		minX: number;
		minY: number;
		maxX: number;
		maxY: number;
		width: number;
		height: number;
	} {
		if (elements.length === 0) {
			return {
				minX: 0,
				minY: 0,
				maxX: 800,
				maxY: 600,
				width: 800,
				height: 600,
			};
		}

		let minX = Number.POSITIVE_INFINITY;
		let minY = Number.POSITIVE_INFINITY;
		let maxX = Number.NEGATIVE_INFINITY;
		let maxY = Number.NEGATIVE_INFINITY;

		for (const element of elements) {
			if (
				!element ||
				typeof element !== "object" ||
				("isDeleted" in element &&
					(element as { isDeleted: boolean }).isDeleted)
			) {
				continue;
			}

			const el = element as Record<string, unknown>;
			const type = el.type as string;
			const x = el.x as number;
			const y = el.y as number;
			const width = el.width as number;
			const height = el.height as number;

			if (
				x !== undefined &&
				y !== undefined &&
				width !== undefined &&
				height !== undefined
			) {
				minX = Math.min(minX, x);
				minY = Math.min(minY, y);
				maxX = Math.max(maxX, x + width);
				maxY = Math.max(maxY, y + height);
			}

			// Handle arrows and lines that use points instead of x/y/width/height
			if (type === "arrow" || type === "line") {
				const points = el.points as number[][];
				const baseX = el.x as number;
				const baseY = el.y as number;
				if (points && points.length > 0) {
					for (const point of points) {
						if (point && point.length >= 2) {
							// For arrows and lines, points are relative to baseX/baseY
							const absoluteX = baseX + point[0];
							const absoluteY = baseY + point[1];
							minX = Math.min(minX, absoluteX);
							minY = Math.min(minY, absoluteY);
							maxX = Math.max(maxX, absoluteX);
							maxY = Math.max(maxY, absoluteY);
						}
					}
				}
			}
		}

		return {
			minX: minX === Number.POSITIVE_INFINITY ? 0 : minX,
			minY: minY === Number.POSITIVE_INFINITY ? 0 : minY,
			maxX: maxX === Number.NEGATIVE_INFINITY ? 800 : maxX,
			maxY: maxY === Number.NEGATIVE_INFINITY ? 600 : maxY,
			width: maxX - minX,
			height: maxY - minY,
		};
	}

	// Special method for generateHtmlFromNodes
	exportHTML(): string {
		const container = document.createElement("div");
		try {
			const { elements, appState } = JSON.parse(this.__data);
			this._renderExcalidraw(container, elements, appState);
		} catch (e) {
			console.error("Error parsing Excalidraw data:", e);
			container.innerHTML =
				'<div class="excalidraw-error">Invalid Excalidraw data</div>';
		}
		return container.outerHTML;
	}
}

export function $createExcalidrawNode(data: string): ExcalidrawNode {
	return new ExcalidrawNode(data);
}

export function $isExcalidrawNode(
	node: LexicalNode | null | undefined,
): node is ExcalidrawNode {
	return node instanceof ExcalidrawNode;
}
