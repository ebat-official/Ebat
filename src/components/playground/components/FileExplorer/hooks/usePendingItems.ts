import { useState } from "react";
import type { FileKind, PendingItem } from "../types";

export function usePendingItems(
	onToggleExpanded?: (path: string) => void,
	isExpanded?: boolean,
) {
	const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);

	const createPendingItem = (itemKind: FileKind, parentPath?: string) => {
		const id = Date.now().toString();
		setPendingItems((prev) => [...prev, { id, kind: itemKind }]);

		// Only expand if the folder is currently collapsed
		// If it's already expanded, don't toggle (which would collapse it)
		if (parentPath && onToggleExpanded && !isExpanded) {
			onToggleExpanded(parentPath);
		}

		return id;
	};

	const removePendingItem = (pendingId: string) => {
		setPendingItems((prev) => prev.filter((item) => item.id !== pendingId));
	};

	return {
		pendingItems,
		createPendingItem,
		removePendingItem,
	};
}
