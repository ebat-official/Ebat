import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { SerializedEditorState } from "lexical";
import { setNodePlaceholderFromSelection } from "./utils/setNodePlaceholderFromSelection/setNodePlaceholderFromSelection";
import useLayoutEffectImpl from "./utils/useLayoutEffect";

interface LexicalOnChangePluginProps {
	onChangeHandler: (data: SerializedEditorState) => void; // Use SerializedEditorState
}

export function LexicalOnChangePlugin({
	onChangeHandler,
}: LexicalOnChangePluginProps) {
	const [editor] = useLexicalComposerContext();

	useLayoutEffectImpl(() => {
		const unregisterListener = editor.registerUpdateListener(
			({ editorState, dirtyElements, dirtyLeaves, prevEditorState, tags }) => {
				if (
					(dirtyElements.size === 0 && dirtyLeaves.size === 0) ||
					tags.has("history-merge") ||
					prevEditorState.isEmpty()
				) {
					return;
				}
				setNodePlaceholderFromSelection(editor);

				editorState.read(() => {
					const json = editorState.toJSON();
					onChangeHandler(json); // Pass the SerializedEditorState
				});
			},
		);

		return () => {
			unregisterListener();
		};
	}, [editor, onChangeHandler]);

	return <></>;
}
