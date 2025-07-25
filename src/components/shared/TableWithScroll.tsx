import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Table } from "@/components/ui/table";
import { cn } from "@/lib/utils";

// Reusable Table component with ScrollArea for horizontal and vertical scrolling
export const TableWithScroll = React.forwardRef<
	HTMLTableElement,
	React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
	<ScrollArea className="grid h-full w-full grid-cols-1 max-h-[50vh] overflow-auto">
		<Table
			ref={ref}
			className={cn("w-full caption-bottom text-sm", className)}
			{...props}
		/>
		<ScrollBar orientation="horizontal" />
		<ScrollBar orientation="vertical" />
	</ScrollArea>
));

TableWithScroll.displayName = "TableWithScroll";
