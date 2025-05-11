import { TableOfContent as TableOfContentType } from "@/utils/types";
import React, { FC } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // Ensure you have the `cn` utility imported
import { CiCircleChevUp } from "react-icons/ci";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";

interface TableOfContentProps {
	tableOfContent: TableOfContentType | undefined;
}

export const TableOfContent: FC<TableOfContentProps> = ({ tableOfContent }) => {
	if (!tableOfContent?.length) {
		return null;
	}
	return (
		<ul className=" relative flex flex-col">
			<div className="my-4 flex flex-col gap-4">
				{tableOfContent.map((item) => (
					<li key={item.id} className="flex gap-2 items-center">
						<div>
							{item.level === 1 && (
								<div className="w-2 h-2 rounded-full bg-green-600" />
							)}
							{item.level === 2 && (
								<div className="w-2 h-[1px] bg-green-600 left-0 translate-x-1/2 relative" />
							)}
							{item.level === 3 && <div className="w-2 h-2" />}
						</div>
						<a
							href={`#${item.id}`}
							className={cn(
								"hover:underline text-ellipsis overflow-hidden sm:whitespace-nowrap capitalize",
								item.level === 1 && "font-semibold text-sm ",
								item.level === 2 && "text-sm",
								item.level === 3 && "pl-2 text-sm",
							)}
						>
							{item.title}
						</a>
					</li>
				))}
			</div>
			<div className="w-[1px] ml-1 left-0 h-full bg-green-600 absolute">
				<FaAngleUp className=" text-green-600 top-0 -translate-y-1/2 left-1/2 -translate-x-1/2" />
				<FaAngleDown className=" text-green-600 bottom-0 absolute translate-y-1/2  left-1/2 -translate-x-1/2" />
			</div>
		</ul>
	);
};
