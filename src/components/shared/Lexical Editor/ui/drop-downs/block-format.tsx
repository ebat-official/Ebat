import { useMemo } from "react";
import {
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListTodo,
  ListOrdered,
  Braces,
  Quote,
} from "lucide-react";
import {
  formatBulletList,
  formatCheckList,
  formatCode,
  formatHeading,
  formatNumberedList,
  formatParagraph,
  formatQuote,
} from "../../utils/editorFormatting";
import { LexicalEditor } from "lexical";
import { DropDown } from ".";

const blockTypeToBlockName = {
  paragraph: "Paragraph",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  bullet: "Bullet List",
  check: "Checklist",
  number: "Numbered List",
  code: "Code Block",
  quote: "Blockquote",
};

export default function BlockFormatDropDown({
  editor,
  blockType,
  disabled = false,
  style,
  ShowChevronsUpDown = true,
  side,
  sideOffset,
}: {
  blockType: keyof typeof blockTypeToBlockName;
  editor: LexicalEditor;
  disabled?: boolean;
  style?: React.CSSProperties;
  ShowChevronsUpDown?: boolean;
  side?: "top" | "right" | "bottom" | "left" | undefined;
  sideOffset?: number;
}) {
  const Blocks = useMemo(
    () => ({
      paragraph: {
        icon: <Pilcrow className="size-4" />,
        label: "paragraph",
        desc: "Just start writing plain text.",
        func: () => formatParagraph(editor),
      },
      h1: {
        icon: <Heading1 className="size-4" />,
        desc: "Heading 1 for main titles.",
        label: "Heading 1",
        func: () => formatHeading(editor, blockType, "h1"),
      },
      h2: {
        icon: <Heading2 className="size-4" />,
        desc: "Heading 2 for major sections.",
        label: "Heading 2",
        func: () => formatHeading(editor, blockType, "h2"),
      },
      h3: {
        icon: <Heading3 className="size-4" />,
        desc: "Heading 3 for sub-sections.",
        label: "Heading 3",
        func: () => formatHeading(editor, blockType, "h3"),
      },
      h4: {
        icon: <Heading4 className="size-4" />,
        desc: "Heading 4 for minor sections.",
        label: "Heading 4",
        func: () => formatHeading(editor, blockType, "h4"),
      },
      h5: {
        icon: <Heading5 className="size-4" />,
        desc: "Heading 5 for small headings.",
        label: "Heading 5",
        func: () => formatHeading(editor, blockType, "h5"),
      },
      h6: {
        icon: <Heading6 className="size-4" />,
        desc: "Heading 6 for tiny headings.",
        label: "Heading 6",
        func: () => formatHeading(editor, blockType, "h6"),
      },
      bullet: {
        icon: <List className="size-4" />,
        desc: "Bullet list for unordered items.",
        label: "Bullet List",
        func: () => formatBulletList(editor, blockType),
      },
      check: {
        icon: <ListTodo className="size-4" />,
        desc: "Checklist for tasks or to-dos.",
        label: "check box",
        func: () => formatCheckList(editor, blockType),
      },
      number: {
        icon: <ListOrdered className="size-4" />,
        desc: "Numbered list for ordered items.",
        label: "Numbered list",
        func: () => formatNumberedList(editor, blockType),
      },
      code: {
        icon: <Braces className="size-4" />,
        desc: "Code block for snippets.",
        label: "Code",
        func: () => formatCode(editor, blockType),
      },
      quote: {
        icon: <Quote className="size-4" />,
        desc: "Blockquote for quotations.",
        label: "Blockquote",
        func: () => formatQuote(editor, blockType),
      },
    }),
    [editor]
  );

  const currentBlock = Blocks[blockType] || Blocks.paragraph;

  return (
    <DropDown
      TriggerClassName={{ ...style, width: "100%" }}
      disabled={disabled}
      side={side}
      sideOffset={sideOffset}
      TriggerLabel={
        <>
          {currentBlock.icon}
          <span className="max-sm:hidden">{currentBlock.label}</span>
        </>
      }
      ShowChevronsUpDown={ShowChevronsUpDown}
      values={Object.values(Blocks)}
    />
  );
}
