import type { EditorThemeClasses } from "lexical";

import "./theme.css";

const theme: EditorThemeClasses = {
	code: `
    bg-[#e1e1e1] dark:bg-[#1a1a1a] m-0 text-sm  
    overflow-auto relative pl-[52px] p-3 font-mono group 
    rounded-sm w-full h-fit block line-code
  `,
	codeHighlight: {
		atrule: "PlaygroundEditorTheme__tokenAttr",
		attr: "PlaygroundEditorTheme__tokenAttr",
		boolean: "PlaygroundEditorTheme__tokenProperty",
		builtin: "PlaygroundEditorTheme__tokenSelector",
		cdata: "PlaygroundEditorTheme__tokenComment",
		char: "PlaygroundEditorTheme__tokenSelector",
		class: "PlaygroundEditorTheme__tokenFunction",
		"class-name": "PlaygroundEditorTheme__tokenFunction",
		comment: "PlaygroundEditorTheme__tokenComment",
		constant: "PlaygroundEditorTheme__tokenProperty",
		deleted: "PlaygroundEditorTheme__tokenProperty",
		doctype: "PlaygroundEditorTheme__tokenComment",
		entity: "PlaygroundEditorTheme__tokenOperator",
		function: "PlaygroundEditorTheme__tokenFunction",
		important: "PlaygroundEditorTheme__tokenVariable",
		inserted: "PlaygroundEditorTheme__tokenSelector",
		keyword: "PlaygroundEditorTheme__tokenAttr",
		namespace: "PlaygroundEditorTheme__tokenVariable",
		number: "PlaygroundEditorTheme__tokenProperty",
		operator: "PlaygroundEditorTheme__tokenOperator",
		prolog: "PlaygroundEditorTheme__tokenComment",
		property: "PlaygroundEditorTheme__tokenProperty",
		punctuation: "PlaygroundEditorTheme__tokenPunctuation",
		regex: "PlaygroundEditorTheme__tokenVariable",
		selector: "PlaygroundEditorTheme__tokenSelector",
		string: "PlaygroundEditorTheme__tokenSelector",
		symbol: "PlaygroundEditorTheme__tokenProperty",
		tag: "PlaygroundEditorTheme__tokenProperty",
		url: "PlaygroundEditorTheme__tokenOperator",
		variable: "PlaygroundEditorTheme__tokenVariable",
	},
	embedBlock: {
		base: "PlaygroundEditorTheme__embedBlock",
		focus: "PlaygroundEditorTheme__embedBlockFocus",
	},
	list: {
		checklist: "PlaygroundEditorTheme__checklist",
		listitem: `
      PlaygroundEditorTheme__listItem
      
    `,
		listitemChecked: "PlaygroundEditorTheme__listItemChecked",
		listitemUnchecked: "PlaygroundEditorTheme__listItemUnchecked",
		nested: {
			listitem: "PlaygroundEditorTheme__nestedListItem",
		},
		olDepth: [
			"PlaygroundEditorTheme__ol1",
			"PlaygroundEditorTheme__ol2",
			"PlaygroundEditorTheme__ol3",
			"PlaygroundEditorTheme__ol4",
			"PlaygroundEditorTheme__ol5",
		],
		ulDepth: [
			"PlaygroundEditorTheme__ul1",
			"PlaygroundEditorTheme__ul2",
			"PlaygroundEditorTheme__ul3",
			"PlaygroundEditorTheme__ul4",
			"PlaygroundEditorTheme__ul5",
		],
		ul: "ul",
		ol: "ol",
	},
	paragraph: `
    
    leading-7
  `,
	link: "underline cursor-pointer text-blue-600",
	hr: "w-full h-1 border-input",
	table: "PlaygroundEditorTheme__table",
	tableCell: "PlaygroundEditorTheme__tableCell",
	tableCellActionButton: "PlaygroundEditorTheme__tableCellActionButton",
	tableCellActionButtonContainer:
		"PlaygroundEditorTheme__tableCellActionButtonContainer",
	tableCellHeader: "PlaygroundEditorTheme__tableCellHeader",
	tableCellResizer: "PlaygroundEditorTheme__tableCellResizer",
	tableCellSelected: "PlaygroundEditorTheme__tableCellSelected",
	tableRowStriping: "PlaygroundEditorTheme__tableRowStriping",
	tableScrollableWrapper: "PlaygroundEditorTheme__tableScrollableWrapper",
	tableSelected: "PlaygroundEditorTheme__tableSelected",
	tableSelection: "PlaygroundEditorTheme__tableSelection",
	layoutContainer: "grid gap-[10px] my-[10px]",
	layoutItem:
		"px-2 py-[16px] border dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 border border-zinc-200 bg-white/90 shadow-md rounded-sm",
	heading: {
		h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
		h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
		h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
		h4: "scroll-m-20 text-xl font-semibold tracking-tight",
		h5: "text-lg font-bold",
		h6: "text-sm font-bold",
	},
	quote: `
    
    mt-6 border-l-[4px] pl-6 italic
  `,
	text: {
		bold: "font-bold",
		capitalize: "capitalize",
		code: "inline-flex items-center rounded-sm border border-zinc-200 px-0.1 py-0 h-fit min-h-[20px] transition-colors focus:outline-hidden focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:border-zinc-800 dark:focus:ring-zinc-300 border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-100/80 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800/80",
		italic: "italic",
		lowercase: "lowercase",
		strikethrough: "line-through",
		underline: "underline",
		underlineStrikethrough: "underline line-through",
		uppercase: "uppercase",
	},
};

export default theme;
