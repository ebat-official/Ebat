import { $createCodeNode } from "@lexical/code";
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  createEditor,
  LexicalEditor,
  TextNode,
} from "lexical";
import { useCallback, useMemo, useState } from "react";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  Code2,
  Columns2,
  Columns3,
  Columns4,
  ImageIcon,
  ImagePlayIcon,
  ListCheck,
  OctagonX,
  Pilcrow,
  QuoteIcon,
  SquarePenIcon,
  StepForward,
  Twitter,
  Youtube,
} from "lucide-react";

import {
  Heading1,
  Heading2,
  Heading3,
  Minus,
  List,
  ListOrdered,
  Table,
} from "lucide-react";

import { INSERT_COLLAPSIBLE_COMMAND } from "../CollapsiblePlugin";
import { cn } from "@/lib/utils";
import { INSERT_LAYOUT_COMMAND } from "../LayoutPlugin";
import { INSERT_POLL_COMMAND } from "../PollPlugin";
import { INSERT_HINT_COMMAND } from "../../nodes/Hint";
import useModal from "../../ui/models/use-model";
import {
  Command,
  CommandItem,
  CommandList,
  CommandInput,
  CommandEmpty,
  CommandShortcut,
} from "@/components/ui/command";
import { SHORTCUTS } from "../ShortcutsPlugin/shortcuts";
import { Skeleton } from "@/components/ui/skeleton";
import { ImagePayload } from "../../nodes/ImageNode";
import { INSERT_IMAGE_COMMAND } from "../ImagesPlugin";
import { AutoEmbedDialog, TwitterEmbedConfig, YoutubeEmbedConfig } from "../AutoEmbedPlugin";
import { initialEditorState, INSERT_STEPPER_COMMAND } from "../../nodes/Stepper";
const InsertGif = React.lazy(() => import("../../ui/models/insert-gif"));
const InsertImageDialog = React.lazy(() =>
  import("../../ui/models/insert-image").then((module) => ({
    default: module.InsertImageDialog,
  }))
);
class ComponentPickerOption extends MenuOption {
  // What shows up in the editor
  title: string;
  // Icon for display
  icon?: React.JSX.Element;
  // For extra searching.
  keywords: Array<string>;
  // TBD
  keyboardShortcut?: string;
  // What happens when you select this option?
  onSelect: (queryString: string) => void;
  desc?: string;
  constructor(
    title: string,
    options: {
      icon?: React.JSX.Element;
      keywords?: Array<string>;
      keyboardShortcut?: string;
      onSelect: (queryString: string) => void;
      desc?: string;
    }
  ) {
    super(title);
    this.title = title;
    this.keywords = options.keywords || [];
    this.icon = options.icon;
    this.keyboardShortcut = options.keyboardShortcut;
    this.onSelect = options.onSelect.bind(this);
    this.desc = options.desc; // Add this line
  }
}

function getDynamicOptions(editor: LexicalEditor, queryString: string) {
  const options: Array<ComponentPickerOption> = [];

  if (queryString == null) {
    return options;
  }

  const tableMatch = queryString.match(/^([1-9]\d?)(?:x([1-9]\d?)?)?$/);

  if (tableMatch !== null) {
    const rows = tableMatch[1];
    const colOptions = tableMatch[2]
      ? [tableMatch[2]]
      : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(String);

    options.push(
      ...colOptions.map(
        (columns) =>
          new ComponentPickerOption(`${rows}x${columns} Table`, {
            icon: <i className="icon table" />,
            keywords: ["table"],
            onSelect: () =>
              editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns, rows }),
          })
      )
    );
  }

  return options;
}

function getBaseOptions(
  editor: LexicalEditor,
  showModal: (
    title?: string | null,
    description?: string | null,
    getContent?: (onClose: () => void) => React.JSX.Element,
    isDilog?: boolean
  ) => void
) {
  return [
    new ComponentPickerOption("Paragraph", {
      icon: <Pilcrow className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
      keywords: ["normal", "paragraph", "p", "text"],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createParagraphNode());
          }
        }),
      desc: "Just start writing with plain text",
    }),
    ...([1, 2, 3] as const).map(
      (n) =>
        new ComponentPickerOption(`Heading ${n}`, {
          icon:
            n === 1 ? (
              <Heading1 className="w-9 h-9 max-sm:h-5 max-sm:w-5" />
            ) : n === 2 ? (
              <Heading2 className="w-9 h-9 max-sm:h-5 max-sm:w-5" />
            ) : (
              <Heading3 className="w-9 h-9 max-sm:h-5 max-sm:w-5" />
            ),
          keywords: ["heading", "header", `h${n}`],
          keyboardShortcut:
            n === 1
              ? SHORTCUTS.HEADING1
              : n === 2
                ? SHORTCUTS.HEADING2
                : SHORTCUTS.HEADING3,
          onSelect: () =>
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(`h${n}`));
              }
            }),
          desc: `${
            n == 1
              ? "Big section heading"
              : n == 2
                ? "Meduim section heading."
                : "Small section heading"
          }`,
        })
    ),
    new ComponentPickerOption("Table", {
      icon: <Table className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
      keywords: ["table", "grid", "spreadsheet", "rows", "columns"],
      desc: "Add simple table content to your blog.",
      onSelect: () =>
        editor.dispatchCommand(INSERT_TABLE_COMMAND, {
          rows: "4",
          columns: "4",
        }),
    }),
    new ComponentPickerOption("Hint", {
      icon: <OctagonX className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
      keywords: [
        "Hint",
        "note",
        "info",
        "alert",
        "alert",
        "success",
        "warning",
        "error",
      ],
      desc: "Add a hint to your content.",
      onSelect: () => editor.dispatchCommand(INSERT_HINT_COMMAND, "hint"),
    }),
    new ComponentPickerOption("Numbered List", {
      icon: <ListOrdered className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
      keywords: ["numbered list", "ordered list", "ol"],
      desc: "Create list with number",
      keyboardShortcut: SHORTCUTS.NUMBERED_LIST,

      onSelect: () =>
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption("Bulleted List", {
      icon: <List className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
      keywords: ["bulleted list", "unordered list", "ul"],
      desc: "Create list with Bulleted",
      keyboardShortcut: SHORTCUTS.BULLET_LIST,

      onSelect: () =>
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption("Check List", {
      icon: <ListCheck className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
      keywords: ["check list", "todo list"],
      desc: "Track tasks with to-do list.",
      keyboardShortcut: SHORTCUTS.CHECK_LIST,

      onSelect: () =>
        editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption("Quote", {
      icon: <QuoteIcon className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
      keywords: ["block quote"],
      desc: "Capture Quote",
      keyboardShortcut: SHORTCUTS.QUOTE,

      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createQuoteNode());
          }
        }),
    }),
    new ComponentPickerOption("Pool", {
      icon: <SquarePenIcon className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
      keywords: ["pool", "vote", "survey"],
      desc: "Add pool to take people votes.",
      onSelect: () =>
        editor.dispatchCommand(INSERT_POLL_COMMAND, "type the Question"),
    }),
    new ComponentPickerOption("Code", {
      icon: <Code2 className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
      keywords: ["javascript", "python", "js", "codeblock"],
      desc: "Add block of code.",
      keyboardShortcut: SHORTCUTS.CODE_BLOCK,

      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            if (selection.isCollapsed()) {
              $setBlocksType(selection, () => $createCodeNode());
            } else {
              const textContent = selection.getTextContent();
              const codeNode = $createCodeNode();
              selection.insertNodes([codeNode]);
              selection.insertRawText(textContent);
            }
          }
        }),
    }),
    new ComponentPickerOption("Divider", {
      icon: <Minus className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
      keywords: ["horizontal rule", "divider", "hr"],
      desc: "Visually divide blocks",

      onSelect: () =>
        editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined),
    }),
    new ComponentPickerOption("Youtube", {
      icon: <Youtube className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
      keywords: ["Youtube", "youtube", "video"],
      desc: "Embedded YouTube videos ",

      onSelect: () => {
        showModal(
          "Youtube",
          "Insert a URL to embed a live preview. Works with YouTube",
          (onClose) => (
            <AutoEmbedDialog
              embedConfig={YoutubeEmbedConfig}
              onClose={onClose}
            />
          ),
          true
        );
      },
    }),
    new ComponentPickerOption("Twitter", {
        icon: <Twitter className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
        keywords: ["Twitter", "tweet", "x","twitter"],
        desc: "Embedded Tweets ",
  
        onSelect: () => {
          showModal(
            "Twitter tweet",
            "Insert a URL to embed a live preview. Works with Twitter",
            (onClose) => (
              <AutoEmbedDialog
                embedConfig={TwitterEmbedConfig}
                onClose={onClose}
              />
            ),
            true
          );
        },
      }),
    new ComponentPickerOption("Image", {
      icon: <ImageIcon className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
      keywords: ["image", "photo", "picture", "file", "img"],
      desc: "Upload or embed with a link",

      onSelect: () =>
        showModal(
          "Insert Image",
          "Please select an image to upload.",
          (onClose) => (
            <React.Suspense
              fallback={<Skeleton className="mx-2 w-[350px] h-[350px]" />}
            >
              <InsertImageDialog activeEditor={editor} onClose={onClose} />
            </React.Suspense>
          ),
          true
        ),
    }),
    new ComponentPickerOption("Poll", {
      icon: <SquarePenIcon className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
      keywords: ["collapse", "collapsible", "toggle"],
      desc: "make poll to take people votes.",
      onSelect: () =>
        editor.dispatchCommand(INSERT_POLL_COMMAND, "type the Question"),
    }),
    new ComponentPickerOption("Collapsible", {
      icon: <StepForward className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
      keywords: ["collapse", "collapsible", "toggle"],
      desc: "Toggles can hide and show content inside.",
      onSelect: () =>
        editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined),
    }),
    new ComponentPickerOption("2 columns", {
      icon: <Columns2 className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
      keywords: ["columns", "flex", "row", "layout", "grid"],
      desc: "Dvide your content into 2 container.",
      onSelect: () => editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr"),
    }),
    new ComponentPickerOption("3 columns", {
      icon: <Columns3 className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
      keywords: ["3columns", "3", "flex", "row", "layout", "grid"],
      desc: "Dvide your content into 3 container.",
      onSelect: () =>
        editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr 1fr"),
    }),
    new ComponentPickerOption("Stepper", {
      icon: <svg  className="w-9 h-9 max-sm:h-5 max-sm:w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" fillRule="evenodd"><path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"></path><path fill="currentColor" d="M5 6a3 3 0 0 1 6 0v2a3 3 0 0 1-6 0zm3-1a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1m9.707-.707a1 1 0 0 0-1.414 0L13.465 7.12a1 1 0 0 0 1.414 1.415L16 7.414V20a1 1 0 1 0 2 0V7.414l1.121 1.122a1 1 0 1 0 1.415-1.415zM5 15a3 3 0 0 1 5.995-.176l.005.186c0 .408-.039.799-.107 1.171c-.264 1.433-.964 2.58-1.57 3.352c-.307.39-.598.694-.815.904c-.124.12-.25.238-.385.345a1 1 0 0 1-1.34-1.479L7.118 19l.224-.228A7 7 0 0 0 7.971 18A3 3 0 0 1 5 15m3-1a1 1 0 1 0 0 2a1 1 0 0 0 0-2"></path></g></svg>,
      keywords: ["stpper", "step", "lines", "routes", "docs", "number"],
      desc: "Stepper with descriptions for each step.",
      onSelect: () =>{
   
        const newEditor = createEditor();
        const parsedEditorState = newEditor.parseEditorState(
          JSON.stringify(initialEditorState)
        );
        newEditor.setEditorState(parsedEditorState);
        const newStep = {
          id: 0,
          title: `New step 0`,
          content:newEditor,
        };
        editor.dispatchCommand(INSERT_STEPPER_COMMAND, [newStep])

      }
    }),
    new ComponentPickerOption("Gifs", {
      icon: <ImagePlayIcon className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
      keywords: ["gif", "gifs", "videos", "short video"],
      desc: "Insert a GIF video",
      onSelect: () => {
        showModal(
          "Insert GIF",
          "Please select a GIF to upload.",
          (onClose) => (
            <React.Suspense
              fallback={<Skeleton className="mx-2 w-[400px] h-[400px]" />}
            >
              <InsertGif
                insertGifOnClick={(payload: ImagePayload) => {
                  editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
                }}
                onClose={onClose}
              />
            </React.Suspense>
          ),
          true
        );
      },
    }),

    new ComponentPickerOption("4 columns", {
      icon: <Columns4 className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
      keywords: ["4columns", "4", "flex", "row", "layout", "grid"],
      desc: "Dvide your content into 4 container.",
      onSelect: () =>
        editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr 1fr 1fr"),
    }),
  ];
}

export default function SlashCommand(): React.JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [Modal, showModal] = useModal();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  const options = useMemo(() => {
    const baseOptions = getBaseOptions(editor, showModal);

    if (!queryString) {
      return baseOptions;
    }

    const regex = new RegExp(queryString, "i");

    return [
      ...getDynamicOptions(editor, queryString),
      ...baseOptions.filter(
        (option) =>
          regex.test(option.title) ||
          option.keywords.some((keyword) => regex.test(keyword))
      ),
    ];
  }, [editor, queryString]);

  const onSelectOption = useCallback(
    (
      selectedOption: ComponentPickerOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string
    ) => {
      editor.update(() => {
        nodeToRemove?.remove();
        selectedOption.onSelect(matchingString);
        closeMenu();
      });
    },
    [editor, showModal]
  );

  return (
    <>
      <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
        onQueryChange={setQueryString}
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        options={options}
        menuRenderFn={(
          anchorElementRef,
          { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
        ) =>
          anchorElementRef.current && options.length
            ? ReactDOM.createPortal(
                <div
                  id={"toolbar"}
                  className={`
                   overflow-x-hidden  z-[100]  relative  max-w-[300px] max-sm:w-[200px] w-[300px] max-h-[300px] h-fit   border rounded-sm  bg-background shadow-sm shadow-muted-foreground/20
                   
                   `}
                >
                  <Command>
                    <CommandInput placeholder="Type a command" />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>

                      {options.map((option, i: number) => (
                        <CommandItem
                          ref={option.ref as React.Ref<HTMLDivElement>}
                          className={cn(
                            selectedIndex == i &&
                            "dark:bg-gray-300/10 bg-gray-400/60",
                            "gap-x-2 h-full items-start hover:bg-transparent border-0 bg-transparent  transition-colors  cursor-pointer rounded-sm relative"
                          )}
                          onSelect={() => {
                            setHighlightedIndex(i);
                            selectOptionAndCleanUp(option);
                          }}
                          onMouseEnter={() => {
                            setHighlightedIndex(i);
                          }}
                          key={option.key}
                        >
                          <div className="p-4 h-full  bg-gray-400/60  dark:bg-gray-300/10 rounded-sm">
                            {option.icon}
                          </div>
                          <div className="flex flex-row justify-between items-center">
                            <div className="flex justify-center items-start flex-col">
                              <div>{option.title}</div>
                              <span className="text-sm text-muted-foreground break-words">
                                {option.desc}
                              </span>
                            </div>
                            {option.keyboardShortcut && (
                              <CommandShortcut className=" absolute top-1 right-2">
                                {option.keyboardShortcut}
                              </CommandShortcut>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </div>,
                anchorElementRef.current
              )
            : null
        }
      />
      {Modal}
    </>
  );
}
