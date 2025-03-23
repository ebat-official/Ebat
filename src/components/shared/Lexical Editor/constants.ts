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
export type PluginNames = keyof typeof PLUGIN_NAMES;
