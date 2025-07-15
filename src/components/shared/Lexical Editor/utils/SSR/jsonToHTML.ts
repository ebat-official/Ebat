"use server";

import { $generateHtmlFromNodes } from "@lexical/html";
import { parseHTML } from "linkedom";

import { SerializedEditorState } from "lexical";
import createHeadlessEditor from "./headless";
import { LexicalNodeType } from "./nodes";

function setupDom() {
	const { window, document } = parseHTML("<html><body></body></html>");
	const _window = global.window;
	const _document = global.document;

	global.window = window;
	global.document = document;

	return () => {
		global.window = _window;
		global.document = _document;
	};
}

function setupWindow() {
	const _window = global.window;
	// need to setup window for CodeNode since facebook#5828
	// https://github.com/facebook/lexical/pull/5828
	// @ts-expect-error
	global.window = global;

	return () => {
		global.window = _window;
	};
}

export async function getHtml(
	serializedEditorState: SerializedEditorState,
	nodes?: LexicalNodeType[],
) {
	if (!serializedEditorState) {
		return "";
	}

	const html: string = await new Promise((resolve) => {
		const cleanup = setupWindow();
		const editor = createHeadlessEditor({ namespace: "html-renderer", nodes });

		editor.setEditorState(editor.parseEditorState(serializedEditorState));
		cleanup();

		editor.update(() => {
			try {
				const cleanup = setupDom();
				const _html = $generateHtmlFromNodes(editor, null);
				cleanup();

				resolve(_html);
			} catch (e) {
				console.error(e);
			}
		});
	});
	return html;
}
