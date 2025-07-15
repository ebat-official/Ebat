"use client";
import React, { FC } from "react";
import RightPanelLayout from "../shared/RightPanelLayout";
import { Card } from "../ui/card";
import { useFeedContext } from "./FeedContext";
import FeedSidebar from "./FeedSidebar";
import QuestionsList from "./QuestionsList";

type FeedProps = {};

export const FeedList: FC<FeedProps> = ({}) => {
	return (
		<div className="flex flex-col gap-4">
			<div className="analytics h-[50px] "></div>
			<RightPanelLayout className="mt-8 min-h-[75vh]">
				<RightPanelLayout.MainPanel className="flex flex-col gap-2">
					<QuestionsList />
				</RightPanelLayout.MainPanel>
				<RightPanelLayout.SidePanel className="sticky h-1/3">
					<FeedSidebar />
				</RightPanelLayout.SidePanel>
			</RightPanelLayout>
		</div>
	);
};
