"use client";
import React, { FC } from "react";
import { useFeedContext } from "./FeedContext";
import RightPanelLayout from "../shared/RightPanelLayout";
import { Card } from "../ui/card";
import QuestionsList from "./QuestionsList";

interface FeedProps {}

const Feed: FC<FeedProps> = ({}) => {
	return (
		<div className="flex flex-col gap-4">
			<div className="analytics h-[300px] bg-red-400">analytics babe</div>
			<RightPanelLayout className="mt-8 min-h-[75vh]">
				<RightPanelLayout.MainPanel className="flex flex-col gap-2">
					<QuestionsList />
				</RightPanelLayout.MainPanel>
				<RightPanelLayout.SidePanel className="sticky h-1/3">
					hello
				</RightPanelLayout.SidePanel>
			</RightPanelLayout>
		</div>
	);
};

export default Feed;
