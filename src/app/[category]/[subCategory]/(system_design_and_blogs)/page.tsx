import { Editor } from "@/components/shared/Editor/Editor_backup";
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

function page() {
	return (
		<RightPanelLayout>
			<RightPanelLayout.MainPanel>
				<Card className="">
					<CardContent className="flex justify-center">helloo</CardContent>
				</Card>
			</RightPanelLayout.MainPanel>
			<RightPanelLayout.SidePanel>
				<Card className=" h-screen" />
			</RightPanelLayout.SidePanel>
		</RightPanelLayout>
	);
}

export default page;
