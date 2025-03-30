import { FORMAT_TEXT_COMMAND, LexicalEditor } from "lexical";
import {
	CaseSensitive,
	CaseUpper,
	HighlighterIcon,
	LucideRemoveFormatting,
	Strikethrough,
	Subscript,
	Superscript,
	Trash,
} from "lucide-react";
import React, { useMemo } from "react";
import { SHORTCUTS } from "../../plugins/ShortcutsPlugin/shortcuts";
import { clearFormatting } from "../../utils/editorFormatting";
import { DropDown } from ".";

export default function TextFormat({
	disabled = false,
	editor,
	toolbarState,
	style,
	ShowChevronsUpDown,
	side,
	sideOffset,
}: {
	disabled: boolean;
	editor: LexicalEditor;
	toolbarState: any;
	style?: React.CSSProperties;
	ShowChevronsUpDown?: boolean;
	side?: "top" | "right" | "bottom" | "left" | undefined;
	sideOffset?: number;
}) {
	const items: any = useMemo(
		() => [
			{
				label: "Lowercase",
				icon: <CaseSensitive className="w-4 h-4" />,
				func: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "lowercase"),
				shortcuts: SHORTCUTS.LOWERCASE,
				selected: toolbarState.isLowercase,
			},
			{
				label: "Uppercase",
				icon: <CaseUpper className="w-4 h-4" />,
				func: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "uppercase"),
				shortcuts: SHORTCUTS.UPPERCASE,
				selected: toolbarState.isUppercase,
			},
			{
				label: "Strikethrough",
				icon: <Strikethrough className="w-4 h-4" />,
				func: () =>
					editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough"),
				shortcuts: SHORTCUTS.STRIKETHROUGH,
				selected: toolbarState.isStrikethrough,
			},
			{
				label: "Subscript",
				icon: <Subscript className="w-4 h-4" />,
				func: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript"),
				shortcuts: SHORTCUTS.SUBSCRIPT,
				selected: toolbarState.isSubscript,
			},
			{
				label: "Superscript",
				icon: <Superscript className="w-4 h-4" />,
				func: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript"),
				shortcuts: SHORTCUTS.SUPERSCRIPT,
				selected: toolbarState.isSuperscript,
			},
			{
				label: "Highlight",
				icon: <HighlighterIcon className="w-4 h-4" />,
				func: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "highlight"),
				selected: toolbarState.isHighlight,
			},
			{
				label: "Clear Formatting",
				icon: <Trash className="w-4 h-4" />,
				func: () => clearFormatting(editor),
				shortcuts: SHORTCUTS.CLEAR_FORMATTING,
				selected: false,
			},
		],
		[editor, toolbarState],
	);

	return (
		<DropDown
			PopoverContentClassName={{ width: "100%" }}
			TriggerClassName={{ ...style, width: "100%" }}
			disabled={disabled}
			sideOffset={sideOffset}
			side={side}
			ShowChevronsUpDown={ShowChevronsUpDown}
			TriggerLabel={<LucideRemoveFormatting />}
			values={items}
		/>
	);
}
