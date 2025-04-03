import { blockTypeToBlockName } from "../../../providers/ToolbarContext";
import {
	$getSelection,
	COMMAND_PRIORITY_LOW,
	FORMAT_TEXT_COMMAND,
	getDOMSelection,
	LexicalEditor,
	SELECTION_CHANGE_COMMAND,
} from "lexical";
import { Dispatch, useCallback, useEffect, useRef } from "react";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { getDOMRangeRect } from "../../../utils/getDOMRangeRect";
import { setFloatingElemPosition } from "../../../utils/setFloatingElemPosition";
import { mergeRegister } from "@lexical/utils";
import { Separator } from "@/components/ui/separator";
import BlockFormatDropDown from "../../drop-downs/block-format";
import { useIsMobile } from "../../../hooks/use-mobile";
import { Toggle } from "@/components/ui/toggle";
import { SHORTCUTS } from "../../../plugins/ShortcutsPlugin/shortcuts";
import { Bold, Code, Italic, Link, UnderlineIcon } from "lucide-react";
import Color from "../../drop-downs/color";
import { sanitizeUrl } from "../../../utils/url";
import TextFormat from "../../drop-downs/text-format";
import Font from "../../drop-downs/font";
import FontSize from "../../drop-downs/font-size";
import AiButton from "../../ai/ai-button";

export default function TextFormatFloatingToolbar({
	editor,
	anchorElem,
	isLink,
	isBold,
	isItalic,
	isUnderline,
	isUppercase,
	isLowercase,
	isCapitalize,
	isCode,
	fontColor,
	isStrikethrough,
	isSubscript,
	isSuperscript,
	bgColor,
	setIsLinkEditMode,
	blockType,
	fontFamily,
	rootType,
	textAlign,
	fontSize,
}: {
	editor: LexicalEditor;
	anchorElem: HTMLElement;
	isBold: boolean;
	isCode: boolean;
	bgColor: string;
	fontColor: string;
	isItalic: boolean;
	isLink: boolean;
	fontFamily: string;
	isUppercase: boolean;
	isLowercase: boolean;
	fontSize: string;
	isCapitalize: boolean;
	isStrikethrough: boolean;
	isSubscript: boolean;
	isSuperscript: boolean;
	isUnderline: boolean;
	setIsLinkEditMode: Dispatch<boolean>;
	blockType: keyof typeof blockTypeToBlockName;
	rootType: "root" | "table";
	textAlign: "left" | "center" | "right" | "justify" | null;
}): React.JSX.Element {
	const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null);
	const isSmall = useIsMobile();

	const insertLink = useCallback(() => {
		if (!isLink) {
			setIsLinkEditMode(true);
			editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl("https://"));
		} else {
			setIsLinkEditMode(false);
			editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
		}
	}, [editor, setIsLinkEditMode, isLink]);
	function mouseMoveListener(e: MouseEvent) {
		if (
			popupCharStylesEditorRef?.current &&
			(e.buttons === 1 || e.buttons === 3)
		) {
			if (popupCharStylesEditorRef.current.style.pointerEvents !== "none") {
				const x = e.clientX;
				const y = e.clientY;
				const elementUnderMouse = document.elementFromPoint(x, y);

				if (!popupCharStylesEditorRef.current.contains(elementUnderMouse)) {
					// Mouse is not over the target element => not a normal click, but probably a drag
					popupCharStylesEditorRef.current.style.pointerEvents = "none";
				}
			}
		}
	}
	function mouseUpListener(e: MouseEvent) {
		if (popupCharStylesEditorRef?.current) {
			if (popupCharStylesEditorRef.current.style.pointerEvents !== "auto") {
				popupCharStylesEditorRef.current.style.pointerEvents = "auto";
			}
		}
	}

	useEffect(() => {
		if (popupCharStylesEditorRef?.current) {
			document.addEventListener("mousemove", mouseMoveListener);
			document.addEventListener("mouseup", mouseUpListener);

			return () => {
				document.removeEventListener("mousemove", mouseMoveListener);
				document.removeEventListener("mouseup", mouseUpListener);
			};
		}
	}, [popupCharStylesEditorRef]);

	const $updateTextFormatFloatingToolbar = useCallback(() => {
		const selection = $getSelection();
		const popupCharStylesEditorElem = popupCharStylesEditorRef.current;
		const nativeSelection = getDOMSelection(editor._window);

		if (!popupCharStylesEditorElem) return;

		const rootElement = editor.getRootElement();
		if (
			selection &&
			nativeSelection &&
			!nativeSelection.isCollapsed &&
			rootElement &&
			rootElement.contains(nativeSelection.anchorNode)
		) {
			const rangeRect = getDOMRangeRect(nativeSelection, rootElement);

			setFloatingElemPosition(rangeRect, popupCharStylesEditorElem, anchorElem);
		}
	}, [editor, anchorElem]);

	useEffect(() => {
		const scrollerElem = anchorElem.parentElement;

		const update = () => {
			editor.getEditorState().read(() => {
				$updateTextFormatFloatingToolbar();
			});
		};

		window.addEventListener("resize", update);
		if (scrollerElem) {
			scrollerElem.addEventListener("scroll", update);
		}

		return () => {
			window.removeEventListener("resize", update);
			if (scrollerElem) {
				scrollerElem.removeEventListener("scroll", update);
			}
		};
	}, [editor, $updateTextFormatFloatingToolbar, anchorElem]);

	useEffect(() => {
		editor.getEditorState().read(() => {
			$updateTextFormatFloatingToolbar();
		});
		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					$updateTextFormatFloatingToolbar();
				});
			}),

			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				() => {
					$updateTextFormatFloatingToolbar();
					return false;
				},
				COMMAND_PRIORITY_LOW,
			),
		);
	}, [editor, $updateTextFormatFloatingToolbar]);

	return (
		<div
			id="toolbar"
			ref={popupCharStylesEditorRef}
			className="

            md:h-[40px] p-1 px-2 gap-1
			w-10 md:w-fit
            border dark:border-zinc-800  
            flex bg-background flex-col md:flex-row md:justify-center md:items-center shadow-md absolute top-0 left-0  text-sm rounded-[6px]
        "
		>
			{/* <AiButton editor={editor} />
      <Separator
        orientation="vertical"
        className="max-sm:h-[1px] max-sm:my-1 max-sm:w-5 h-5 mx-1"
      /> */}
			<BlockFormatDropDown
				editor={editor}
				blockType={blockType}
				style={{ height: "25px" }}
				ShowChevronsUpDown={false}
				side={isSmall ? "right" : "bottom"}
				sideOffset={isSmall ? 10 : 5}
			/>
			<Separator
				orientation="vertical"
				className="max-sm:h-[1px] max-sm:my-1 max-sm:w-5 h-5 mx-1"
			/>
			{/* <FontSize
        selectionFontSize={fontSize.slice(0, -2)}
        editor={editor}
        disabled={false}
        className="h-[25px]"
        classNameContent="max-sm:flex-col"
      />
      <Separator
        orientation="vertical"
        className="max-sm:h-[1px] max-sm:my-1 max-sm:w-5 h-5 mx-1"
      /> */}
			{/* <Font
				disabled={false}
				style={{ fontFamily: fontFamily, height: "25px", padding: "0px 13px" }}
				value={fontFamily}
				editor={editor}
				ShowChevronsUpDown={false}
				side={isSmall ? "right" : "bottom"}
				sideOffset={isSmall ? 10 : 5}
			/> */}
			<Separator
				orientation="vertical"
				className="max-sm:h-[1px] max-sm:my-1 max-sm:w-5 h-5 mx-1"
			/>
			<div className="flex flex-col items-center justify-center gap-1 md:flex-row">
				<Toggle
					variant={"outline"}
					className="p-1"
					pressed={isBold}
					onPressedChange={() => {
						editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
					}}
					tip={`Bold ${SHORTCUTS.BOLD}`}
					aria-label={`Format text as bold. Shortcut: ${SHORTCUTS.BOLD}`}
				>
					<Bold />
				</Toggle>
				<Toggle
					variant={"outline"}
					className="p-1"
					pressed={isItalic}
					onPressedChange={() => {
						editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
					}}
					tip={`Italic (${SHORTCUTS.ITALIC})`}
					type="button"
					aria-label={`Format text as italics. Shortcut: ${SHORTCUTS.ITALIC}`}
				>
					<Italic />
				</Toggle>
				<Toggle
					variant={"outline"}
					className="p-1"
					pressed={isUnderline}
					onPressedChange={() => {
						editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
					}}
					tip={`Underline (${SHORTCUTS.UNDERLINE})`}
					type="button"
					aria-label={`Format text to underlined. Shortcut: ${SHORTCUTS.UNDERLINE}`}
				>
					<UnderlineIcon />
				</Toggle>
				<Toggle
					variant={"outline"}
					className="p-1"
					pressed={isCode}
					onPressedChange={() => {
						editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
					}}
					tip={`Insert code block (${SHORTCUTS.INSERT_CODE_BLOCK})`}
					type="button"
					aria-label="Insert code block"
				>
					<Code />
				</Toggle>
				<Toggle
					variant={"outline"}
					className="p-1"
					onPressedChange={insertLink}
					pressed={isLink}
					aria-label="Insert link"
					tip={`Insert link (${SHORTCUTS.INSERT_LINK})`}
					type="button"
				>
					<Link />
				</Toggle>
			</div>
			<Separator
				orientation="vertical"
				className="max-sm:h-[1px] max-sm:my-1 max-sm:w-5 h-5 mx-1"
			/>
			<Color
				disabled={false}
				side={isSmall ? "right" : "bottom"}
				sideOffset={isSmall ? 10 : 5}
				style={{ height: "25px" }}
				color={fontColor}
				bgColor={bgColor}
				editor={editor}
			/>
			<Separator
				orientation="vertical"
				className="max-sm:h-[1px] max-sm:my-1 max-sm:w-5 h-5 mx-1"
			/>
			<TextFormat
				disabled={false}
				editor={editor}
				ShowChevronsUpDown={false}
				side={isSmall ? "right" : "bottom"}
				sideOffset={isSmall ? 10 : 5}
				style={{ height: "2px" }}
				toolbarState={{
					isLowercase,
					isUppercase,
					isCapitalize,
					isStrikethrough,
					isSubscript,
					isSuperscript,
				}}
			/>
		</div>
	);
}
