const VERTICAL_GAP = 10;
const HORIZONTAL_OFFSET = 5;

export function setFloatingElemPosition(
	targetRect: DOMRect | null,
	floatingElem: HTMLElement,
	anchorElem: HTMLElement,
	verticalGap: number = VERTICAL_GAP,
	horizontalOffset: number = HORIZONTAL_OFFSET,
): void {
	const scrollerElem = anchorElem.parentElement;

	if (targetRect === null || !scrollerElem) {
		floatingElem.style.opacity = "0";
		floatingElem.style.transform = "translate(-10000px, -10000px)";
		return;
	}

	const floatingElemRect = floatingElem.getBoundingClientRect();
	const anchorElementRect = anchorElem.getBoundingClientRect();
	const editorScrollerRect = scrollerElem.getBoundingClientRect();

	// Calculate initial top and left positions
	let top = targetRect.bottom + verticalGap;
	let left = targetRect.left + horizontalOffset;

	// Ensure the floating element stays within the editor's bounds
	if (top + floatingElemRect.height > editorScrollerRect.bottom) {
		// If it overflows at the bottom, position it above the selection
		top = targetRect.top - floatingElemRect.height - verticalGap;
	}

	if (left + floatingElemRect.width > editorScrollerRect.right) {
		// If it overflows on the right, align it with the right edge of the editor
		left = editorScrollerRect.right - floatingElemRect.width - horizontalOffset;
	}

	if (left < editorScrollerRect.left) {
		// If it overflows on the left, align it with the left edge of the editor
		left = editorScrollerRect.left + horizontalOffset;
	}

	// Adjust for the anchor element's position
	top -= anchorElementRect.top;
	left -= anchorElementRect.left;

	// Apply smooth transition and positioning
	floatingElem.style.transition =
		"transform 0.2s ease-in-out, opacity 0.2s ease-in-out";
	floatingElem.style.opacity = "1";
	floatingElem.style.transform = `translate(${left}px, ${top}px)`;
}
