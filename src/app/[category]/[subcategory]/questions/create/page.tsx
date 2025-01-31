import { Editor } from "@/components/shared/Editor/Editor";
import RightPanelLayout from "@/components/shared/RightPanelLayout";
import React from "react";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import EditorQuestion from "@/components/shared/Editor/EditorQuestion";
import { Button } from "@/components/ui/button";
import ButtonBlue from "@/components/shared/ButtonBlue";
import QuestionSidebar from "@/components/rightSidebar/QuestionSidebar";

function page() {
	return (
		<div className="mt-8">
			<RightPanelLayout>
				<RightPanelLayout.MainPanel>
					<div className="relative ">
						<div className="btn-container flex gap-4 -mt-2 mr-8 justify-end absolute top-0 right-0 -translate-y-full">
							<Button variant="outline">Save</Button>
							<Button variant="outline">Preview</Button>
							<ButtonBlue title="Publish" />
						</div>
						<EditorQuestion />
					</div>
				</RightPanelLayout.MainPanel>
				<RightPanelLayout.SidePanel>
					<QuestionSidebar />
				</RightPanelLayout.SidePanel>
			</RightPanelLayout>
		</div>
	);
}

export default page;
