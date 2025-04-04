import * as React from "react";

import { LexicalEditor } from "lexical";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	MAX_ALLOWED_FONT_SIZE,
	MIN_ALLOWED_FONT_SIZE,
} from "../../providers/ToolbarContext";
import {
	updateFontSize,
	updateFontSizeInSelection,
	UpdateFontSizeType,
} from "../../utils/editorFormatting";
import { SHORTCUTS } from "../../plugins/ShortcutsPlugin/shortcuts";
import { Input } from "@/components/ui/input";

export function parseAllowedFontSize(input: string): string {
	const match = input.match(/^(\d+(?:\.\d+)?)px$/);
	if (match) {
		const n = Number(match[1]);
		if (n >= MIN_ALLOWED_FONT_SIZE && n <= MAX_ALLOWED_FONT_SIZE) {
			return input;
		}
	}
	return "";
}

export default function FontSize({
	selectionFontSize,
	disabled,
	editor,
	className,
	classNameContent,
}: {
	selectionFontSize: string;
	disabled: boolean;
	editor: LexicalEditor;
	className?: string;
	classNameContent?: string;
}) {
	const [inputValue, setInputValue] = React.useState<string>(selectionFontSize);
	const [inputChangeFlag, setInputChangeFlag] = React.useState<boolean>(false);
	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const inputValueNumber = Number(inputValue);

		if (e.key === "Tab") {
			return;
		}
		if (["e", "E", "+", "-"].includes(e.key) || isNaN(inputValueNumber)) {
			e.preventDefault();
			setInputValue("");
			return;
		}
		setInputChangeFlag(true);
		if (e.key === "Enter" || e.key === "Escape") {
			e.preventDefault();

			updateFontSizeByInputValue(inputValueNumber);
		}
	};
	const handleInputBlur = () => {
		if (inputValue !== "" && inputChangeFlag) {
			const inputValueNumber = Number(inputValue);
			updateFontSizeByInputValue(inputValueNumber);
		}
	};

	const updateFontSizeByInputValue = (inputValueNumber: number) => {
		let updatedFontSize = inputValueNumber;
		if (inputValueNumber > MAX_ALLOWED_FONT_SIZE) {
			updatedFontSize = MAX_ALLOWED_FONT_SIZE;
		} else if (inputValueNumber < MIN_ALLOWED_FONT_SIZE) {
			updatedFontSize = MIN_ALLOWED_FONT_SIZE;
		}

		setInputValue(String(updatedFontSize));
		updateFontSizeInSelection(editor, String(updatedFontSize) + "px", null);
		setInputChangeFlag(false);
	};

	React.useEffect(() => {
		setInputValue(selectionFontSize);
	}, [selectionFontSize]);
	return (
		<div className={cn("flex flex-row items-center gap-1", classNameContent)}>
			<Button
				type="button"
				className={className}
				disabled={
					disabled ||
					(selectionFontSize !== "" &&
						Number(inputValue) <= MIN_ALLOWED_FONT_SIZE)
				}
				variant={"outline"}
				size="sm"
				onClick={() =>
					updateFontSize(editor, UpdateFontSizeType.decrement, inputValue)
				}
			>
				<Minus className="w-[15px] h-[15px]" />
			</Button>

			<Input
				type="number"
				value={inputValue}
				disabled={disabled}
				className={cn(
					"h-7 min-w-[29px] w-[29px] px-[6px] appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance:textfield]",
					className,
				)}
				min={MIN_ALLOWED_FONT_SIZE}
				max={MAX_ALLOWED_FONT_SIZE}
				onChange={(e) => setInputValue(e.target.value)}
				onKeyDown={handleKeyPress}
				onBlur={handleInputBlur}
			/>
			<Button
				type="button"
				className={className}
				disabled={
					disabled ||
					(selectionFontSize !== "" &&
						Number(inputValue) >= MAX_ALLOWED_FONT_SIZE)
				}
				variant={"outline"}
				size="sm"
				onClick={() =>
					updateFontSize(editor, UpdateFontSizeType.increment, inputValue)
				}
			>
				<Plus className="w-4 h-4" />
			</Button>
		</div>
	);
}
