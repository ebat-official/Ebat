import { $getSelection, $isRangeSelection, LexicalEditor } from "lexical";
import { $patchStyleText, $setBlocksType } from "@lexical/selection";
import { $createCodeNode } from "@lexical/code";
import React, { useMemo, lazy, Suspense } from "react";
import useModal from "../models/use-model";
import {
  AlertCircle,
  Code2,
  Columns2,
  Columns3,
  Columns4,
  DraftingCompass,
  FlipHorizontal2,
  Image,
  ImagePlay,
  PencilRuler,
  Plus,
  SquareChevronRight,
  SquarePenIcon,
  Table,
  Twitter,
  Youtube,
} from "lucide-react";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { DropDown } from ".";
import {
  INSERT_IMAGE_COMMAND,
  InsertImagePayload,
} from "../../plugins/ImagesPlugin";
import { Skeleton } from "@/components/ui/skeleton";
import { INSERT_LAYOUT_COMMAND } from "../../plugins/LayoutPlugin";
import { INSERT_COLLAPSIBLE_COMMAND } from "../../plugins/CollapsiblePlugin";
import {
  AutoEmbedDialog,
  TwitterEmbedConfig,
  YoutubeEmbedConfig,
} from "../../plugins/AutoEmbedPlugin";
import { INSERT_HINT_COMMAND } from "../../nodes/Hint";
import { INSERT_EXCALIDRAW_COMMAND } from "../../plugins/ExcalidrawPlugin";
import { PLUGIN_NAMES } from "../../constants";

const InsertMediaDialog = lazy(() =>
  import("../models/insertMedia").then((module) => ({
    default: module.InsertMediaDialog,
  }))
);
const InsertGif = lazy(() => import("../models/insert-gif"));
const InsertTableBody = lazy(() =>
  import("../../ui/models/insert-table").then((module) => ({
    default: module.InsertTable,
  }))
);
const InsertPoll = lazy(() =>
  import("../../ui/models/insert-poll").then((module) => ({
    default: module.InsertPoll,
  }))
);

interface Items {
  label: string;
  icon: React.ReactNode;
  func: () => void;
  shortcuts?: string;
}

export default function InsertNode({
  disabled,
  editor,
}: {
  disabled: boolean;
  editor: LexicalEditor;
}) {
  const [model, showModal] = useModal();
  const insertGifOnClick = (payload: InsertImagePayload) => {
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
  };

  const items: Items[] = useMemo(
    () => [
      {
        label: PLUGIN_NAMES.HORIZONTAL_RULE,
        icon: <FlipHorizontal2 className="w-4 h-4" />,
        func: () =>
          editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined),
      },
      {
        label: PLUGIN_NAMES.MEDIA,
        icon: <Image className="size-4" />,
        func: () => {
          showModal(
            PLUGIN_NAMES.MEDIA,
            "Please select the Media to upload.",
            (onClose) => (
              <Suspense
                fallback={<Skeleton className="mx-2 w-[350px] h-[350px]" />}
              >
                <InsertMediaDialog activeEditor={editor} onClose={onClose} />
              </Suspense>
            ),
            true
          );
        },
      },
      {
        label: PLUGIN_NAMES.EXCALIDRAW,
        icon: <DraftingCompass className="w-4 h-4" />,
        func: () =>
          editor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, undefined),
      },
      {
        label: PLUGIN_NAMES.CODE,
        icon: <Code2 />,
        func: () => {
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
          });
        },
      },
      {
        label: PLUGIN_NAMES.GIFS,
        icon: <ImagePlay className="w-4 h-4" />,
        func: () => {
          showModal(
            PLUGIN_NAMES.GIFS,
            "Please select a GIF to upload.",
            (onClose) => (
              <Suspense
                fallback={<Skeleton className="mx-2 w-[400px] h-[400px]" />}
              >
                <InsertGif
                  insertGifOnClick={insertGifOnClick}
                  onClose={onClose}
                />
              </Suspense>
            ),
            true
          );
        },
      },
      {
        label: PLUGIN_NAMES.TABLE,
        icon: <Table className="w-4 h-4" />,
        func: () => {
          showModal(
            PLUGIN_NAMES.TABLE,
            "Please configure your table.",
            (onClose) => (
              <Suspense
                fallback={<Skeleton className="mx-2 w-[400px] h-[100px]" />}
              >
                <InsertTableBody activeEditor={editor} onClose={onClose} />
              </Suspense>
            ),
            true
          );
        },
      },
      {
        label: PLUGIN_NAMES.POLL,
        icon: <SquarePenIcon className="w-4 h-4" />,
        func: () => {
          showModal(
            PLUGIN_NAMES.POLL,
            "Please type your question.",
            (onClose) => (
              <Suspense
                fallback={<Skeleton className="mx-2 w-[400px] h-[100px]" />}
              >
                <InsertPoll activeEditor={editor} onClose={onClose} />
              </Suspense>
            ),
            true
          );
        },
      },
      {
        label: PLUGIN_NAMES.TWO_COLUMNS_EQUAL,
        icon: <Columns2 className="w-4 h-4" />,
        func: () => {
          editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr");
        },
      },
      {
        label: PLUGIN_NAMES.THREE_COLUMNS_EQUAL,
        icon: <Columns3 className="w-4 h-4" />,
        func: () => {
          editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr 1fr");
        },
      },
      {
        label: PLUGIN_NAMES.FOUR_COLUMNS_EQUAL,
        icon: <Columns4 className="w-4 h-4" />,
        func: () => {
          editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr 1fr 1fr");
        },
      },
      {
        label: PLUGIN_NAMES.TWO_COLUMNS_25_75,
        icon: <Columns2 className="w-4 h-4" />,
        func: () => {
          editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 3fr");
        },
      },
      {
        label: PLUGIN_NAMES.COLLAPSIBLE_CONTAINER,
        icon: <SquareChevronRight className="w-4 h-4" />,
        func: () => {
          editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined);
        },
      },
      {
        label: PLUGIN_NAMES.TWITTER,
        icon: <Twitter className="w-4 h-4" />,
        func: () => {
          showModal(
            PLUGIN_NAMES.TWITTER,
            "Insert a URL to embed a live preview. Works with Twitter, Google Drive, Vimeo, and more.",
            (onClose) => (
              <AutoEmbedDialog
                embedConfig={TwitterEmbedConfig}
                onClose={onClose}
              />
            ),
            true
          );
        },
      },
      {
        label: PLUGIN_NAMES.YOUTUBE,
        icon: <Youtube />,
        func: () => {
          showModal(
            PLUGIN_NAMES.YOUTUBE,
            "Insert a URL to embed a live preview. Works with YouTube, Google Drive, Vimeo, and more.",
            (onClose) => (
              <AutoEmbedDialog
                embedConfig={YoutubeEmbedConfig}
                onClose={onClose}
              />
            ),
            true
          );
        },
      },
      {
        label: PLUGIN_NAMES.HINT,
        icon: <AlertCircle />,
        func: () => {
          editor.dispatchCommand(INSERT_HINT_COMMAND, "info");
        },
      },
    ],
    [editor, showModal]
  );

  return (
    <>
      <DropDown
        values={items}
        TriggerClassName={{ width: "115px" }}
        TriggerLabel={
          <>
            <Plus />
            <span>Insert</span>
          </>
        }
        disabled={disabled}
      />
      {model}
    </>
  );
}
