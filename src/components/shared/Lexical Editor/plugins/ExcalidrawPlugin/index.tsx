import type { JSX } from "react";
import type { ExcalidrawInitialElements } from "../../ui/excaliDraw/ExcalidrawModal";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement } from "@lexical/utils";
import {
	$createParagraphNode,
	$insertNodes,
	$isRootOrShadowRoot,
	COMMAND_PRIORITY_EDITOR,
	LexicalCommand,
	createCommand,
} from "lexical";
import { useEffect, useState } from "react";

import { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import {
	$createExcalidrawNode,
	ExcalidrawNode,
} from "../../nodes/ExcalidrawNode";
import ExcalidrawModal from "../../ui/excaliDraw/ExcalidrawModal";

export const INSERT_EXCALIDRAW_COMMAND: LexicalCommand<void> = createCommand(
	"INSERT_EXCALIDRAW_COMMAND",
);

export default function ExcalidrawPlugin(): JSX.Element | null {
	const [editor] = useLexicalComposerContext();
	const [isModalOpen, setModalOpen] = useState<boolean>(false);

	useEffect(() => {
		if (!editor.hasNodes([ExcalidrawNode])) {
			throw new Error(
				"ExcalidrawPlugin: ExcalidrawNode not registered on editor",
			);
		}

		return editor.registerCommand(
			INSERT_EXCALIDRAW_COMMAND,
			() => {
				setModalOpen(true);
				return true;
			},
			COMMAND_PRIORITY_EDITOR,
		);
	}, [editor]);

	const onClose = () => {
		setModalOpen(false);
	};

	const onDelete = () => {
		setModalOpen(false);
	};

	const onSave = (
		elements: ExcalidrawInitialElements,
		appState: Partial<AppState>,
		files: BinaryFiles,
	) => {
		editor.update(() => {
			const excalidrawNode = $createExcalidrawNode("[]", "inherit", 400);
			excalidrawNode.setData(
				JSON.stringify({
					appState,
					elements,
					files,
				}),
			);
			$insertNodes([excalidrawNode]);
			if ($isRootOrShadowRoot(excalidrawNode.getParentOrThrow())) {
				$wrapNodeInElement(excalidrawNode, $createParagraphNode).selectEnd();
			}
		});
		setModalOpen(false);
	};
	return isModalOpen ? (
		<ExcalidrawModal
			initialElements={[]}
			initialAppState={{} as AppState}
			initialFiles={{}}
			isShown={isModalOpen}
			onDelete={onDelete}
			onClose={onClose}
			onSave={onSave}
			closeOnClickOutside={false}
		/>
	) : null;
}
