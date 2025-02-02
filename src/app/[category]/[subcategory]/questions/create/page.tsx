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
						<Button variant="outline">Save</Button>
						<Button variant="outline">Preview</Button>
						<ButtonBlue title="Publish" />
					</div>
					<EditorQuestion />
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
