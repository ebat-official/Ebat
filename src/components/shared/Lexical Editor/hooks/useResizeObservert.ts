import { useEffect, useState } from "react";

export const useResizeObserver = (
	target: Element | null,
	callback?: (entry: DOMRectReadOnly) => void,
) => {
	const [size, setSize] = useState<DOMRectReadOnly>();

	useEffect(() => {
		if (!target) return;

		const observer = new ResizeObserver(([entry]) => {
			setSize(entry.contentRect);
			callback?.(entry.contentRect);
		});

		observer.observe(target);
		return () => observer.disconnect();
	}, [target, callback]);

	return size;
};
