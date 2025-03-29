import { $getSelection, LexicalEditor } from "lexical";
import React, { CSSProperties, useCallback } from "react";
import { $patchStyleText } from "@lexical/selection";
import { DropDown } from ".";

interface FontOption {
  label: string;
  func: () => void;
  style: CSSProperties;
}

export default function Font({
  editor,
  style,
  disabled,
  value,
  sideOffset,
  side,
  ShowChevronsUpDown,
}: {
  editor: LexicalEditor;
  disabled: boolean;
  value: string;
  style?: React.CSSProperties;
  ShowChevronsUpDown?: boolean;
  side?: "top" | "right" | "bottom" | "left" | undefined;
  sideOffset?: number;
}) {
  const applyFont = useCallback(
    (font: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection !== null) {
          $patchStyleText(selection, {
            ["font-family"]: font,
          });
        }
      });
    },
    [editor, style]
  );

  const FONT_FAMILY_OPTIONS: FontOption[] = [
    {
      label: "Arial",
      func: () => applyFont("Arial"),
      style: { fontFamily: "Arial" },
    },
    {
      label: "Courier New",
      func: () => applyFont("Courier New"),
      style: { fontFamily: "Courier New" },
    },
    {
      label: "Georgia",
      func: () => applyFont("Georgia"),
      style: { fontFamily: "Georgia" },
    },
    {
      label: "Times New Roman",
      func: () => applyFont("Times New Roman"),
      style: { fontFamily: "Times New Roman" },
    },
    {
      label: "Trebuchet MS",
      func: () => applyFont("Trebuchet MS"),
      style: { fontFamily: "Trebuchet MS" },
    },
    {
      label: "Verdana",
      func: () => applyFont("Verdana"),
      style: { fontFamily: "Verdana" },
    },
    {
      label: "Comic Sans MS",
      func: () => applyFont("Comic Sans MS"),
      style: { fontFamily: "Comic Sans MS" },
    },
    {
      label: "Calibri",
      func: () => applyFont("Calibri"),
      style: { fontFamily: "Calibri" },
    },
    {
      label: "Poppins",
      func: () => applyFont("Poppins"),
      style: { fontFamily: "Poppins" },
    },
    {
      label: "Alegreya",
      func: () => applyFont("Alegreya"),
      style: { fontFamily: "Alegreya" },
    },
    {
      label: "Bree Serif",
      func: () => applyFont("Bree Serif"),
      style: { fontFamily: "Bree Serif" },
    },
    {
      label: "Cambria",
      func: () => applyFont("Cambria"),
      style: { fontFamily: "Cambria" },
    },
    {
      label: "Impact",
      func: () => applyFont("Impact"),
      style: { fontFamily: "Impact" },
    },
    {
      label: "Lexend",
      func: () => applyFont("Lexend"),
      style: { fontFamily: "Lexend" },
    },
    {
      label: "Lobster",
      func: () => applyFont("Lobster"),
      style: { fontFamily: "Lobster" },
    },
    {
      label: "Lora",
      func: () => applyFont("Lora"),
      style: { fontFamily: "Lora" },
    },
    {
      label: "Permanent Marker",
      func: () => applyFont("Permanent Marker"),
      style: { fontFamily: "Permanent Marker" },
    },
    {
      label: "Ultra",
      func: () => applyFont("Ultra"),
      style: { fontFamily: "Ultra" },
    },
    {
      label: "Reenie Beanie",
      func: () => applyFont("Reenie Beanie"),
      style: { fontFamily: "Reenie Beanie" },
    },
  ];

  
  return (
    <DropDown
      ShowChevronsUpDown={ShowChevronsUpDown}
      side={side}
      sideOffset={sideOffset}
      PopoverContentClassName={{ minWidth: "80px", width: "150px" }}
      TriggerClassName={{ ...style, width: "100%" }}
      disabled={disabled}
      TriggerLabel={value}
      values={FONT_FAMILY_OPTIONS}
    />
  );
}
