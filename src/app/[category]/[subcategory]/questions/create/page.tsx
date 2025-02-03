"use client";
import RightPanelLayout from "@/components/shared/RightPanelLayout";
import React, { useEffect, useState } from "react";

import EditorQuestion from "@/components/shared/Editor/EditorQuestion";
import { Button } from "@/components/ui/button";
import ButtonBlue from "@/components/shared/ButtonBlue";
import QuestionSidebar from "@/components/rightSidebar/QuestionSidebar";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import {
	SubCategory,
	subCategorySupportedTypes,
} from "@/utils/subCategoryConfig";
import { CiSaveDown2 } from "react-icons/ci";
import { MdOutlinePublish } from "react-icons/md";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
// Type guard to narrow down the type
function isValidSubcategory(subcategory: string): subcategory is SubCategory {
	return subCategorySupportedTypes.has(subcategory);
}

function page() {
	const { category, subcategory: subcategoryRoute } = useParams();
	const [sidebarData, setSidebatData] = useState({});
	const subcategory = Array.isArray(subcategoryRoute)
		? subcategoryRoute[0]
		: subcategoryRoute;

	if (!category || !subcategory || !isValidSubcategory(subcategory)) {
		notFound();
	}
	console.log(sidebarData);
	return (
		<RightPanelLayout className="mt-8 min-h-[75vh]">
			<RightPanelLayout.MainPanel className="relative">
				<>
					<div className="btn-container flex gap-4 -mt-2 mr-8 justify-end absolute top-0 right-0 -translate-y-full">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										className="justify-center items-center flex ga-2"
									>
										<CiSaveDown2 />
										<span>Save</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Save as draft</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>

						<Button className="bg-gradient-to-tl from-blue-600 to-cyan-400 text-white flex gap-2 justify-center items-center">
							<MdOutlinePublish />
							<span>Publish</span>
						</Button>
					</div>
					<EditorQuestion
						postId="123456"
						onChangeCallback={(data) => console.log(data)}
						// dataLoading={true}
					/>
				</>
			</RightPanelLayout.MainPanel>
			<RightPanelLayout.SidePanel>
				<QuestionSidebar
					subcategory={subcategory}
					getSidebarData={setSidebatData}
				/>
			</RightPanelLayout.SidePanel>
		</RightPanelLayout>
	);
}

export default page;
