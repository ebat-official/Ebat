import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { PostSortOrder } from "@/utils/types";
import React from "react";
import { FaSortAmountDown } from "react-icons/fa";

interface SortDropdownProps {
	value: PostSortOrder;
	onChange: (order: PostSortOrder) => void;
	className?: string;
}

const SORT_OPTIONS = [
	{ label: "Latest", value: PostSortOrder.Latest },
	{ label: "Oldest", value: PostSortOrder.Oldest },
	{ label: "Most Votes", value: PostSortOrder.MostVotes },
];

const SortDropdown: React.FC<SortDropdownProps> = ({
	value,
	onChange,
	className,
}) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					className={cn(
						"rounded-full opacity-80 select-none focus-visible:ring-0 w-10 h-10 hover:bg-muted-foreground/10 transition-colors",
						className,
					)}
					variant="ghost"
					size="icon"
				>
					<FaSortAmountDown />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-40">
				<DropdownMenuLabel>Sort By</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					{SORT_OPTIONS.map((option) => (
						<DropdownMenuItem
							key={option.value}
							onClick={() => onChange(option.value)}
							className={
								value === option.value ? "font-semibold text-green-600" : ""
							}
						>
							{option.label}
						</DropdownMenuItem>
					))}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default SortDropdown;
