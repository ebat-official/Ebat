import {
	BeautifulMentionsMenuItemProps,
	BeautifulMentionsMenuProps,
} from "lexical-beautiful-mentions";

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "@/components/ui/command";

export function MentionMenu({
	loading,
	children,
	...props
}: BeautifulMentionsMenuProps) {
	return (
		<Command
			className={`
		  absolute rounded-lg border shadow-md h-28 overflow-y-auto min-w-28 w-max 
		  ${loading ? "opacity-70 pointer-events-none" : ""}
		`}
			{...props}
		>
			{loading ? (
				<div className="p-2 text-center text-gray-500">Loading...</div>
			) : (
				<CommandList>{children}</CommandList>
			)}
		</Command>
	);
}

export function MentionMenuItem({
	selected,
	item,
	...props
}: BeautifulMentionsMenuItemProps) {
	return (
		<CommandItem>
			<div
				{...props}
				className={`${selected ? "bg-muted" : ""} ${props.className || ""}`}
			>
				{item.value}
			</div>
		</CommandItem>
	);
}
