import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { $getNodeByKey, LexicalEditor, NodeKey } from "lexical";
import {
	AlignCenterVertical,
	CaptionsIcon,
	Fullscreen,
	PanelLeftClose,
	Radius,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { $isImageNode } from "../../nodes/ImageNode";

export default function ImageToolBar({
	editor,
	nodeKey,
	height,
	width,
}: {
	editor: LexicalEditor;
	nodeKey: NodeKey;
	height: string | number;
	width: string | number;
}) {
	const [showResizeInput, setShowResizeInput] = useState(false);
	const [widthInput, setWidthInput] = useState(String(width));
	const [heightInput, setHeightInput] = useState(String(height));
	const [showInput, setShowInput] = useState(false);

	const toggleResizeInput = useCallback(() => {
		setShowResizeInput((prev) => !prev);
	}, []);
	const setShowCaption = () => {
		editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if ($isImageNode(node)) {
				const currentState = node.__showCaption;
				node.setShowCaption(!currentState);
			}
		});
	};

	const updateWidthAndHeight = useCallback(() => {
		const newWidth = Number(widthInput);
		const newHeight = Number(heightInput);

		if (isNaN(newWidth) || isNaN(newHeight)) return;
		if (newWidth > 990 || newHeight > 1800) return;
		if (newWidth < 140 || newHeight < 90) return;

		editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if ($isImageNode(node)) {
				node.setWidthAndHeight(newWidth, newHeight);
			}
		});
	}, [editor, nodeKey, widthInput, heightInput]);

	useEffect(() => {
		const debounceTimeout = setTimeout(() => {
			updateWidthAndHeight();
		}, 500);
		return () => clearTimeout(debounceTimeout);
	}, [widthInput, heightInput, updateWidthAndHeight]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter") {
				updateWidthAndHeight();
			}
		},
		[updateWidthAndHeight],
	);

	const handleWidthChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setWidthInput(e.target.value);
		},
		[],
	);

	const handleHeightChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setHeightInput(e.target.value);
		},
		[],
	);
	useEffect(() => {
		setWidthInput(String(width));
		setHeightInput(String(height));
	}, [height, width]);

	const ChangeSideToLeft = useCallback(() => {
		editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if ($isImageNode(node)) {
				node.setAlignment("start");
			}
		});
	}, [editor, nodeKey]);

	const ChangeSideToCenter = useCallback(() => {
		editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if ($isImageNode(node)) {
				node.setAlignment("center");
			}
		});
	}, [editor, nodeKey]);

	const ChangeSideToRight = useCallback(() => {
		editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if ($isImageNode(node)) {
				node.setAlignment("end");
			}
		});
	}, [editor, nodeKey]);
	const ChangeRounded = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			editor.update(() => {
				const node = $getNodeByKey(nodeKey);
				if ($isImageNode(node)) {
					const roundedValue = Number.parseInt(event.target.value);
					node.setRounded(roundedValue);
				}
			});
		},
		[editor, nodeKey],
	);
	return (
		<div className="absolute z-50 flex flex-row items-center transition-all duration-500 opacity-0 gap-x-2 top-1 left-1 group-hover:opacity-100">
			<div className="flex flex-row items-center justify-between p-1 rounded-sm bg-background/40">
				{/* <div className="flex flex-row items-center">
					<Button
						onClick={toggleResizeInput}
						variant={"ghost"}
						size={"sm"}
						className="w-6 h-6 p-1 "
					>
						<Fullscreen className="size-2" />
					</Button>
					<div
						className={cn(
							"transition-all duration-500  ease-in-out",
							showResizeInput ? "w-[30px] mx-1" : "w-0",
						)}
					>
						<Input
							type="number"
							placeholder="0px"
							max={990}
							min={120}
							value={widthInput}
							onChange={handleWidthChange}
							onKeyDown={handleKeyDown}
							className={cn(
								"h-5 px-0.5 w-full rounded-sm text-xs outline-hidden transition-opacity duration-300 ease-in-out",
								showResizeInput ? "opacity-100" : "opacity-0",
							)}
						/>
					</div>
					<div
						className={cn(
							"transition-all duration-500 ease-in-out",
							showResizeInput ? "w-[30px]" : "w-0",
						)}
					>
						<Input
							type="number"
							placeholder="0px"
							max={1800}
							min={120}
							value={heightInput}
							onChange={handleHeightChange}
							onKeyDown={handleKeyDown}
							className={cn(
								"h-5 px-0.5 w-full text-xs rounded-sm outline-hidden transition-opacity duration-300 ease-in-out",
								showResizeInput ? "opacity-100" : "opacity-0",
							)}
						/>
					</div>
				</div>
				<Separator orientation="vertical" className="h-5 mx-1" /> */}
				<div className="flex flex-row items-center gap-x-1">
					<Button
						onClick={ChangeSideToLeft}
						variant={"ghost"}
						size={"sm"}
						className="w-6 h-6 p-1 "
					>
						<PanelLeftClose />
					</Button>
					<Button
						size={"sm"}
						variant={"ghost"}
						onClick={ChangeSideToCenter}
						className=" mx-1 w-6 h-6 p-1 opacity-[0.70] hover:opacity-100 transition-opacity"
					>
						<AlignCenterVertical />
					</Button>
					<Button
						size={"sm"}
						variant={"ghost"}
						onClick={ChangeSideToRight}
						className="  w-6 h-6 p-1 opacity-[0.70] hover:opacity-100 transition-opacity"
					>
						<PanelLeftClose />
					</Button>
				</div>
				<Separator orientation="vertical" className="h-5 mx-1" />

				<Button
					size={"sm"}
					variant={"ghost"}
					onClick={() => {
						setShowInput(!showInput);
					}}
					className="  w-6 h-6 p-1 opacity-[0.70] hover:opacity-100 transition-opacity"
				>
					<Radius />
				</Button>
				<div
					className={cn(
						"overflow-hidden transition-all duration-500 ease-in-out ",
						showInput ? "w-[60px]" : "w-0",
					)}
				>
					<Input
						type="range"
						min="0"
						max="120"
						defaultValue="0"
						onChange={ChangeRounded}
						className={cn(
							"h-5 px-1 py-0 transition-opacity duration-300 ease-in-out",
							showInput ? "opacity-100" : "opacity-0",
						)}
					/>
				</div>

				<Separator orientation="vertical" className="h-5 mx-1" />

				<Button
					size={"sm"}
					variant={"ghost"}
					onClick={setShowCaption}
					className="  w-6 h-6 p-1 opacity-[0.70] hover:opacity-100 transition-opacity"
				>
					<CaptionsIcon />
				</Button>
			</div>
		</div>
	);
}
