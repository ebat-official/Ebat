import { cn } from "@/lib/utils";
import { DraggableBlockPlugin_EXPERIMENTAL } from "@lexical/react/LexicalDraggableBlockPlugin";
import { JSX, useRef } from "react";

const DRAGGABLE_BLOCK_MENU_CLASSNAME = "draggable-block-menu";

export default function DraggableBlockPlugin({
	anchorElem = document.body,
	className,
}: {
	anchorElem?: HTMLElement;
	className?: string;
}): JSX.Element {
	const menuRef = useRef<any>(null);
	const targetLineRef = useRef<any>(null);

	const isOnMenu = (element: HTMLElement): boolean => {
		return !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`);
	};

	return (
		<DraggableBlockPlugin_EXPERIMENTAL
			anchorElem={anchorElem}
			menuRef={menuRef}
			targetLineRef={targetLineRef}
			menuComponent={
				<div
					ref={menuRef}
					className={cn(
						"draggable-block-menu  transition-all  z-50 absolute top-0 -left-4",
						className,
					)}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="w-4 cursor-move rounded-sm h-4 z-50"
						data-name="Layer 1"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path
							stroke="currentColor"
							d="M8.5 10a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm0 7a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm7-10a2 2 0 1 0-2-2 2 2 0 0 0 2 2Zm-7-4a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm7 14a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm0-7a2 2 0 1 0 2 2 2 2 0 0 0-2-2Z"
						/>
					</svg>
				</div>
			}
			targetLineComponent={
				<div
					ref={targetLineRef}
					className="cursor-none bg-sky-600 h-1 absolute left-0 top-0 opacity-0 will-change-transform"
				/>
			}
			isOnMenu={isOnMenu}
		/>
	);
}
