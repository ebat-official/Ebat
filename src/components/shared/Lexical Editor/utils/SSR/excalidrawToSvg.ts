import { readFile } from "fs/promises";
import { parseHTML } from "linkedom";

export const excalidrawToSvg = async (
	diagram: object | string,
): Promise<Element> => {
	const excalidrawUtilsCode = await readFile(
		"./node_modules/@excalidraw/utils/dist/prod/index.js",
		"utf8",
	);

	const path2DPolyfillCode = await readFile(
		"./node_modules/canvas-5-polyfill/canvas.js",
		"utf8",
	);

	const { document, window } = parseHTML(`
    <body>
      <script type="module"></script>
    </body>
  `);

	// Provide mocks for required globals
	(globalThis as any).window = window;
	(globalThis as any).document = document;
	(globalThis as any).Path2D = undefined;
	(globalThis as any).CanvasRenderingContext2D = class {};

	const stringifiedDiagram =
		typeof diagram === "string" ? diagram : JSON.stringify(diagram);

	const script = `
    ${path2DPolyfillCode}
    ${excalidrawUtilsCode}
    const run = async () => {
      const { exportToSvg } = ExcalidrawUtils;
      const svg = await exportToSvg(${stringifiedDiagram});
      document.body.appendChild(svg);
    };
    run();
  `;

	const scriptEl = document.createElement("script");
	scriptEl.textContent = script;
	document.body.appendChild(scriptEl);

	return new Promise((resolve, reject) => {
		let attempts = 0;
		const maxAttempts = 50;
		const interval = setInterval(() => {
			const svg = document.querySelector("svg");
			if (svg) {
				clearInterval(interval);
				resolve(svg);
			} else if (++attempts >= maxAttempts) {
				clearInterval(interval);
				reject(new Error("SVG was not generated in time."));
			}
		}, 20);
	});
};
