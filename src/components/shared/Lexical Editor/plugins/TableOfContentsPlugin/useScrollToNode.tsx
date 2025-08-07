import type { NodeKey } from "lexical";
import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/store/useEditorStore";

export function useScrollToNode() {
	const [selectedKey, setSelectedKey] = useState<NodeKey | null>(null);
	const selectedIndex = useRef<number>(0);
	const { editor, setSelectedContentKey } = useEditorStore();

	useEffect(() => {
		setSelectedContentKey(selectedKey);
	}, [selectedKey]);

	const scrollToNode = (key: NodeKey, currIndex: number) => {
		editor?.getEditorState().read(() => {
			const domElement = editor.getElementByKey(key);
			if (domElement !== null) {
				// Add a temporary class for styling
				domElement.classList.add("ScrollToStyle");

				// Smooth scroll to the element
				domElement.scrollIntoView({ behavior: "smooth", block: "center" });
				setSelectedKey(key);
				selectedIndex.current = currIndex;

				// Remove the temporary class after 2 seconds
				setTimeout(() => {
					domElement.classList.remove("ScrollToStyle");
				}, 2000);
			}
		});
	};

	return { scrollToNode, selectedKey, selectedIndex, setSelectedKey };
}
