import { useCallback, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { findBeautifulMentionNodes } from "./utils";

export type MentionData = {
	trigger: string;
	value: string;
	data?: {
		id?: string;
		label?: string;
	};
};

interface MentionsPluginProps {
	onMentionsChange?: (mentions: MentionData[]) => void;
}

export function MentionChangePlugin({ onMentionsChange }: MentionsPluginProps) {
	const [editor] = useLexicalComposerContext();

	const getMentions = useCallback(() => {
		return editor.getEditorState().read(() => {
			const nodes = findBeautifulMentionNodes(editor);
			return nodes.map((node) => {
				const { trigger, value, data } = node.exportJSON();
				return { trigger, value, data };
			});
		});
	}, [editor]);

	useEffect(() => {
		if (!onMentionsChange) return;

		// Initial call
		onMentionsChange(getMentions());

		// Subscribe to changes
		return editor.registerUpdateListener(() => {
			onMentionsChange(getMentions());
		});
	}, [editor, getMentions, onMentionsChange]);

	return null;
}
