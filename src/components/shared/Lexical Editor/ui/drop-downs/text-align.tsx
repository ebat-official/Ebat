import React, { useMemo } from "react";
import {
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  LexicalEditor,
  OUTDENT_CONTENT_COMMAND,
} from "lexical";
import { SHORTCUTS } from "../../plugins/ShortcutsPlugin/shortcuts";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignJustify,
  OutdentIcon,
  Indent,
} from "lucide-react";
import { DropDown } from ".";

export default function textAlign({
  editor,
  value,
  isRTL,
  disabled = false,
}: {
  editor: LexicalEditor;
  value: ElementFormatType | "left" | "center" | "right" | "justify" | null;
  isRTL: boolean;
  disabled: boolean;
}) {
  const ELEMENT_FORMAT_OPTIONS: {
    [key in Exclude<ElementFormatType, "">]: {
      icon: React.ReactNode;
      shortcuts?: string;
      func: () => void;
      label: string;
    };
  } = useMemo(
    () => ({
      center: {
        icon: <AlignCenter className="w-4 h-4" />,
        func: () => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
        },
        shortcuts: SHORTCUTS.CENTER_ALIGN,
        label: "Center Align",
      },
      end: {
        icon: <AlignRight className="w-4 h-4" />,
        func: () => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "end");
        },
        shortcuts: SHORTCUTS.LEFT_ALIGN,

        label: "End Align",
      },
      justify: {
        icon: <AlignJustify className="w-4 h-4" />,
        func: () => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
        },
        shortcuts: SHORTCUTS.JUSTIFY_ALIGN,

        label: "Justify Align",
      },
      left: {
        icon: <AlignLeft className="w-4 h-4" />,
        func: () => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
        },
        shortcuts: SHORTCUTS.LEFT_ALIGN,

        label: "Left Align",
      },
      right: {
        icon: <AlignRight className="w-4 h-4" />,
        func: () => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
        },
        shortcuts: SHORTCUTS.RIGHT_ALIGN,

        label: "Right Align",
      },
      start: {
        icon: <AlignLeft className="w-4 h-4" />,
        func: () => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "start");
        },
        label: "Start Align",
      },
      Outdent: {
        icon: <OutdentIcon className="w-4 h-4" />,
        func: () => {
          editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
        },
        label: "Outdent",
      },
      func: {
        icon: <Indent className="w-4 h-4" />,
        func: () => {
          editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
        },
        label: "Indent",
      },
    }),
    [editor]
  );
  return (
    <DropDown
      values={Object.values(ELEMENT_FORMAT_OPTIONS)}
      TriggerClassName={{ width: "120px" }}
      PopoverContentClassName={{width:"220px"}}
      TriggerLabel={
        <>
            {value ? ELEMENT_FORMAT_OPTIONS[value].icon : ELEMENT_FORMAT_OPTIONS["left"].icon }
            {value || "left"}
        </>
      } 
      disabled={disabled}
    />
  );
}
