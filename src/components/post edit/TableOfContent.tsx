import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // Ensure you have the `cn` utility imported
import { TableOfContent as TableOfContentType } from "@/utils/types";
import React, { FC } from "react";
import { CiCircleChevUp } from "react-icons/ci";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { LuBadgeInfo } from "react-icons/lu";
import { useScrollToNode } from "../shared/Lexical Editor/plugins/TableOfContentsPlugin/useScrollToNode";
import { useEditorStore } from "@/store/useEditorStore";

type TableOfContentProps = Record<string, never>;

export const TableOfContent: FC<TableOfContentProps> = () => {
	const { tableOfContent, selectedContentKey } = useEditorStore();
	const { scrollToNode } = useScrollToNode();
	if (!tableOfContent?.length) {
		return (
			<div className="flex text-sm  mt-4  gap-2">
				<IoIosInformationCircleOutline size={30} />
				<span className="text-muted-foreground">
					Adding <strong>Heading 1</strong>, <strong>Heading 2</strong>, or{" "}
					<strong>Heading 3</strong> elements will automatically create a table
					of contents.
				</span>
			</div>
		);
	}
	return (
		<ul className=" relative flex flex-col mt-4">
			<div className="my-4 flex flex-col gap-4">
				{tableOfContent.map(([key, text, tag], index) => (
					<li key={key} className="flex gap-2 items-center">
						<div>
							{tag === "h1" && (
								<div className="w-2 h-2 rounded-full bg-green-600" />
							)}
							{tag === "h2" && (
								<div className="w-2 h-[1px] bg-green-600 left-0 translate-x-1/2 relative" />
							)}
							{tag === "h3" && <div className="w-2 h-2" />}
						</div>
						<button
							type="button"
							onClick={() => scrollToNode(key, index)}
							className={cn(
								"hover:underline text-ellipsis overflow-hidden sm:whitespace-nowrap capitalize",
								tag === "h1" && "font-semibold text-sm ",
								tag === "h2" && "text-sm",
								tag === "h3" && "pl-2 text-sm",
								selectedContentKey === key && "text-green-600",
							)}
						>
							{text}
						</button>
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
