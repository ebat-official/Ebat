import type { JSX } from "react";
import {
	Dialog,
	DialogDescription,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogClose,
} from "../models/custom-dialog";
import "@excalidraw/excalidraw/index.css";
const Excalidraw = dynamic(
	async () => (await import("@excalidraw/excalidraw")).Excalidraw,
	{
		ssr: false,
	},
);
import {
	AppState,
	BinaryFiles,
	ExcalidrawImperativeAPI,
	ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";
import { isDOMNode } from "lexical";
import * as React from "react";
import {
	ReactPortal,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export type ExcalidrawInitialElements = ExcalidrawInitialDataState["elements"];

type Props = {
	closeOnClickOutside?: boolean;
	/**
	 * The initial set of elements to draw into the scene
	 */
	initialElements: ExcalidrawInitialElements;
	/**
	 * The initial set of elements to draw into the scene
	 */
	initialAppState: AppState;
	/**
	 * The initial set of elements to draw into the scene
	 */
	initialFiles: BinaryFiles;
	/**
	 * Controls the visibility of the modal
	 */
	isShown?: boolean;
	/**
	 * Callback when closing and discarding the new changes
	 */
	onClose: () => void;
	/**
	 * Completely remove Excalidraw component
	 */
	onDelete: () => void;
	/**
	 * Callback when the save button is clicked
	 */
	onSave: (
		elements: ExcalidrawInitialElements,
		appState: Partial<AppState>,
		files: BinaryFiles,
	) => void;
};

export const useCallbackRefState = () => {
	const [refValue, setRefValue] =
		React.useState<ExcalidrawImperativeAPI | null>(null);
	const refCallback = React.useCallback(
		(value: ExcalidrawImperativeAPI | null) => setRefValue(value),
		[],
	);
	return [refValue, refCallback] as const;
};

/**
 * @explorer-desc
 * A component which renders a modal with Excalidraw (a painting app)
 * which can be used to export an editable image
 */
export default function ExcalidrawModal({
	closeOnClickOutside = false,
	onSave,
	initialElements,
	initialAppState,
	initialFiles,
	isShown = false,
	onDelete,
	onClose,
}: Props): ReactPortal | null {
	const excaliDrawModelRef = useRef<HTMLDivElement | null>(null);
	const [excalidrawAPI, excalidrawAPIRefCallback] = useCallbackRefState();
	const [discardModalOpen, setDiscardModalOpen] = useState(false);
	const [elements, setElements] =
		useState<ExcalidrawInitialElements>(initialElements);
	const [files, setFiles] = useState<BinaryFiles>(initialFiles);

	const { theme } = useTheme();
	const isDarkMode = theme === "dark";

	useEffect(() => {
		if (excaliDrawModelRef.current !== null) {
			excaliDrawModelRef.current.focus();
		}
	}, []);

	useEffect(() => {
		let modalOverlayElement: HTMLElement | null = null;

		const clickOutsideHandler = (event: MouseEvent) => {
			const target = event.target;
			if (
				excaliDrawModelRef.current !== null &&
				isDOMNode(target) &&
				!excaliDrawModelRef.current.contains(target) &&
				closeOnClickOutside
			) {
				onDelete();
			}
		};

		if (excaliDrawModelRef.current !== null) {
			modalOverlayElement = excaliDrawModelRef.current?.parentElement;
			if (modalOverlayElement !== null) {
				modalOverlayElement?.addEventListener("click", clickOutsideHandler);
			}
		}

		return () => {
			if (modalOverlayElement !== null) {
				modalOverlayElement?.removeEventListener("click", clickOutsideHandler);
			}
		};
	}, [closeOnClickOutside, onDelete]);

	useLayoutEffect(() => {
		const currentModalRef = excaliDrawModelRef.current;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onDelete();
			}
		};

		if (currentModalRef !== null) {
			currentModalRef.addEventListener("keydown", onKeyDown);
		}

		return () => {
			if (currentModalRef !== null) {
				currentModalRef.removeEventListener("keydown", onKeyDown);
			}
		};
	}, [elements, files, onDelete]);

	const save = () => {
		if (elements && elements.filter((el) => !el.isDeleted).length > 0) {
			const appState = excalidrawAPI?.getAppState();
			// We only need a subset of the state
			const partialState: Partial<AppState> = {
				exportBackground: appState?.exportBackground,
				exportScale: appState?.exportScale,
				exportWithDarkMode: appState?.theme === "dark",
				isBindingEnabled: appState?.isBindingEnabled,
				isLoading: appState?.isLoading,
				name: appState?.name,
				theme: appState?.theme,
				viewBackgroundColor: appState?.viewBackgroundColor,
				viewModeEnabled: appState?.viewModeEnabled,
				zenModeEnabled: appState?.zenModeEnabled,
				zoom: appState?.zoom,
			};
			onSave(elements, partialState, files);
		} else {
			// delete node if the scene is clear
			onDelete();
		}
	};

	const discard = () => {
		setDiscardModalOpen(true);
	};

	function ShowDiscardDialog(): JSX.Element {
		return (
			<Dialog open={discardModalOpen} onOpenChange={setDiscardModalOpen}>
				<DialogContent className="w-full max-w-md p-6 bg-white dark:bg-zinc-900">
					<DialogHeader>
						<DialogTitle className="text-zinc-900 dark:text-white">
							Discard
						</DialogTitle>
					</DialogHeader>
					<DialogDescription className="text-zinc-600 dark:text-zinc-400">
						Are you sure you want to discard the changes?
					</DialogDescription>
					<div className="mt-2 ExcalidrawModal__discardModal">
						<Button
							onClick={() => {
								setDiscardModalOpen(false);
								onClose();
							}}
						>
							Discard
						</Button>{" "}
						<Button
							onClick={() => {
								setDiscardModalOpen(false);
							}}
						>
							Cancel
						</Button>
					</div>
					<DialogClose />
				</DialogContent>
			</Dialog>
		);
	}

	if (isShown === false) {
		return null;
	}

	const onChange = (
		els: ExcalidrawInitialElements,
		_: AppState,
		fls: BinaryFiles,
	) => {
		setElements(els);
		setFiles(fls);
	};

	return createPortal(
		<div className="fixed inset-0 flex flex-col items-center z-100">
			<div
				className="relative z-10 top-[50px] flex justify-center items-center rounded-lg"
				ref={excaliDrawModelRef}
				tabIndex={-1}
			>
				<div className="relative pt-10 bg-transparent w-[70vw] h-[70vh] border-4 border-background rounded-2xl custom-styles shadow-lg">
					{discardModalOpen && <ShowDiscardDialog />}
					<Excalidraw
						onChange={onChange}
						excalidrawAPI={excalidrawAPIRefCallback}
						initialData={{
							appState: {
								...initialAppState,
								isLoading: false,
								theme: isDarkMode ? "dark" : "light",
							},
							elements: initialElements,
							files: initialFiles,
						}}
						theme={isDarkMode ? "dark" : "light"}
					/>
					<div className="absolute top-0 z-10 flex gap-4 p-3 right-1">
						<Button size="sm" className="" variant="outline" onClick={discard}>
							Discard
						</Button>
						<Button size="sm" className="" variant="outline" onClick={save}>
							Save
						</Button>
					</div>
				</div>
			</div>
		</div>,
		document.body,
	);
}
