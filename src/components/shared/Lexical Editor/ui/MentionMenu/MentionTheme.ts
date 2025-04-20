import { BeautifulMentionsTheme } from "lexical-beautiful-mentions";

/**
 * this mentionsStyle style is used in SSR parser as well
 */
export const mentionsStyle =
	"text-blue-500 px-1 mx-2/3 mx-px font-medium font- align-baseline inline-block rounded break-words cursor-pointer leading-5 bg-foreground/10";
const mentionsStyleFocused = "ring-2 ring-offset-1";

export const beautifulMentionsTheme: BeautifulMentionsTheme = {
	"@": `${mentionsStyle}  `,
	"@Focused": `${mentionsStyleFocused}  ring-blue-300 ring-offset-background`,
	"rec:": {
		trigger: "text-blue-500",
		value: "text-orange-500",
		container:
			"mx-[2px] px-[4px] rounded border border-muted cursor-pointer bg-red-500",
		containerFocused:
			"mx-[2px] px-[4px] rounded border border-muted cursor-pointer",
	},
	"\\w+:": `${mentionsStyle} dark:bg-gray-400 bg-gray-500 text-accent`,
	"\\w+:Focused": `${mentionsStyleFocused} dark:ring-gray-400 ring-gray-500 ring-offset-background`,
};
