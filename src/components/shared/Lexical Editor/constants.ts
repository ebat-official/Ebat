import { DEFAULT_SETTINGS } from "./appSettings";

export const PLUGIN_NAMES = {
  PARAGRAPH: "Paragraph",
  HEADING_1: "Heading 1",
  HEADING_2: "Heading 2",
  HEADING_3: "Heading 3",

  TABLE: "Table",
  TABLE_CELL_ACTION_MENU: "Table Cell Action Menu",
  TABLE_CELL_RESIZER: "Table Cell Resizer",
  TABLE_HOVER_ACTIONS: "Table Hover Actions",
  TABLE_OF_CONTENTS: "Table of Contents",

  HINT: "Hint",
  EXCALIDRAW: "Excalidraw",

  NUMBERED_LIST: "Numbered List",
  BULLETED_LIST: "Bulleted List",
  CHECK_LIST: "Check List",
  QUOTE: "Quote",

  POLL: "Poll",
  CODE: "Code",
  DIVIDER: "Divider",

  YOUTUBE: "Youtube",
  TWITTER: "Twitter",
  IMAGE: "Image",
  GIFS: "Gifs",

  COLLAPSIBLE: "Collapsible",

  TWO_COLUMNS: "2 columns",
  THREE_COLUMNS: "3 columns",
  FOUR_COLUMNS: "4 columns",

  STEPPER: "Stepper",

  TOOLBAR: "Toolbar",
  FLOATING_LINK_EDITOR: "Floating Link Editor",
  FLOATING_TEXT_FORMAT_TOOLBAR: "Floating Text Format Toolbar",
  LINK: "Link",
  LINK_WITH_METADATA: "Link with Metadata",
  CLICKABLE_LINK: "Clickable Link",
  AUTO_LINK: "Auto Link",

  SLASH_COMMAND: "Slash Command",
  MARKDOWN_SHORTCUTS: "Markdown Shortcuts",

  AUTO_FOCUS: "Auto Focus",
  AUTO_EMBED: "Auto Embed",
  CLEAR_EDITOR: "Clear Editor",
  CODE_ACTION_MENU: "Code Action Menu",
  DRAG_DROP_PASTE: "Drag Drop Paste",
  DRAGGABLE_BLOCK: "Draggable Block",
  LEXICAL_ONCHANGE: "Lexical OnChange",
  SHORTCUTS: "Shortcuts",
  TAB_FOCUS: "Tab Focus",
  TAB_INDENTATION: "Tab Indentation",
  HISTORY: "History",
  HORIZONTAL_RULE: "Horizontal Rule",
  MEDIA: "Media",
  TWO_COLUMNS_EQUAL: "2 columns (equal width)",
  THREE_COLUMNS_EQUAL: "3 columns (equal width)",
  FOUR_COLUMNS_EQUAL: "4 columns (equal width)",
  TWO_COLUMNS_25_75: "2 columns (25% - 75%)",
  COLLAPSIBLE_CONTAINER: "Collapsible container",
} as const;

export const PLUGIN_TO_FLAG_MAP: Record<
  string,
  keyof typeof DEFAULT_SETTINGS | null
> = {
  [PLUGIN_NAMES.PARAGRAPH]: null,
  [PLUGIN_NAMES.HEADING_1]: null,
  [PLUGIN_NAMES.HEADING_2]: null,
  [PLUGIN_NAMES.HEADING_3]: null,

  [PLUGIN_NAMES.TABLE]: "enableTablePlugin",
  [PLUGIN_NAMES.TABLE_CELL_ACTION_MENU]: "enableTableCellActionMenuPlugin",
  [PLUGIN_NAMES.TABLE_CELL_RESIZER]: "enableTableCellResizerPlugin",
  [PLUGIN_NAMES.TABLE_HOVER_ACTIONS]: "enableTableHoverActionsPlugin",
  [PLUGIN_NAMES.TABLE_OF_CONTENTS]: "enableTableOfContentsPlugin",

  [PLUGIN_NAMES.HINT]: "enableHintPlugin",
  [PLUGIN_NAMES.EXCALIDRAW]: "enableExcalidrawPlugin",

  [PLUGIN_NAMES.NUMBERED_LIST]: "enableListPlugin",
  [PLUGIN_NAMES.BULLETED_LIST]: "enableListPlugin",
  [PLUGIN_NAMES.CHECK_LIST]: "enableCheckListPlugin",
  [PLUGIN_NAMES.QUOTE]: "enableListPlugin",

  [PLUGIN_NAMES.POLL]: "enablePollPlugin",
  [PLUGIN_NAMES.CODE]: "enableCodeHighlightPlugin",
  [PLUGIN_NAMES.DIVIDER]: "enableHorizontalRulePlugin",

  [PLUGIN_NAMES.YOUTUBE]: "enableYouTubePlugin",
  [PLUGIN_NAMES.TWITTER]: "enableTwitterPlugin",
  [PLUGIN_NAMES.IMAGE]: "enableImagesPlugin",
  [PLUGIN_NAMES.GIFS]: "enableImagesPlugin",

  [PLUGIN_NAMES.COLLAPSIBLE]: "enableCollapsiblePlugin",

  [PLUGIN_NAMES.TWO_COLUMNS]: "enableLayoutPlugin",
  [PLUGIN_NAMES.THREE_COLUMNS]: "enableLayoutPlugin",
  [PLUGIN_NAMES.FOUR_COLUMNS]: "enableLayoutPlugin",

  [PLUGIN_NAMES.STEPPER]: "enableStepperPlugin",

  [PLUGIN_NAMES.TOOLBAR]: "enableToolbarPlugin",
  [PLUGIN_NAMES.FLOATING_LINK_EDITOR]: "enableFloatingLinkEditorPlugin",
  [PLUGIN_NAMES.FLOATING_TEXT_FORMAT_TOOLBAR]:
    "enableFloatingTextFormatToolbarPlugin",
  [PLUGIN_NAMES.LINK]: "enableLinkPlugin",
  [PLUGIN_NAMES.LINK_WITH_METADATA]: "enableLinkWithMetaDataPlugin",
  [PLUGIN_NAMES.CLICKABLE_LINK]: "enableClickableLinkPlugin",
  [PLUGIN_NAMES.AUTO_LINK]: "enableLexicalAutoLinkPlugin",

  [PLUGIN_NAMES.SLASH_COMMAND]: "enableSlashCommand",
  [PLUGIN_NAMES.MARKDOWN_SHORTCUTS]: "enableMarkdownShortcutPlugin",

  [PLUGIN_NAMES.AUTO_FOCUS]: "enableAutoFocusPlugin",
  [PLUGIN_NAMES.AUTO_EMBED]: "enableAutoEmbedPlugin",
  [PLUGIN_NAMES.CLEAR_EDITOR]: "enableClearEditorPlugin",
  [PLUGIN_NAMES.CODE_ACTION_MENU]: "enableCodeActionMenuPlugin",
  [PLUGIN_NAMES.DRAG_DROP_PASTE]: "enableDragDropPastePlugin",
  [PLUGIN_NAMES.DRAGGABLE_BLOCK]: "enableDraggableBlockPlugin",
  [PLUGIN_NAMES.LEXICAL_ONCHANGE]: "enableLexicalOnChangePlugin",
  [PLUGIN_NAMES.SHORTCUTS]: "enableShortcutsPlugin",
  [PLUGIN_NAMES.TAB_FOCUS]: "enableTabFocusPlugin",
  [PLUGIN_NAMES.TAB_INDENTATION]: "enableTabIndentationPlugin",
  [PLUGIN_NAMES.HISTORY]: "enableHistoryPlugin",
};
