"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import CheckboxGrid, { InternalOption } from "./ChecboxGrid";
import RadioGroupGrid from "./RadioGrid";
import useCompanies from "@/hooks/useCompanyList";
import useTopics from "@/hooks/useTopicList";
import DurationPicker from "../shared/DurationPicker";
import { MdOutlineGpsFixed } from "react-icons/md";
import { RiBuilding2Line } from "react-icons/ri";
import { AiOutlineTag } from "react-icons/ai";
import { IoMdTime } from "react-icons/io";
import { convertFromMinutes, convertToMinutes } from "@/utils/converToMinutes";
import useLocalStorage from "@/hooks/useLocalStorage";
import TooltipAccordianTrigger from "../shared/TooltipAccordianTrigger";
import { getLocalStorage, setLocalStorage } from "@/lib/localStorage";
import { QuestionSidebarData, TopicCategory } from "@/utils/types";

export type Duration = {
	days: string;
	hours: string;
	minutes: string;
};

interface QuestionSidebarProps {
	topicCategory: TopicCategory;
	getSidebarData: (args: QuestionSidebarData) => void;
	postId: string;
	defaultContent?: QuestionSidebarData | undefined;
	dataLoading?: boolean;
}

const INITIAL_DURATION: Duration = { days: "0", minutes: "5", hours: "0" };

function QuestionSidebar({
	topicCategory,
	getSidebarData,
	postId,
	defaultContent,
	dataLoading,
}: QuestionSidebarProps) {
	const { companies, searchCompanies } = useCompanies();
	const { topics, searchTopics } = useTopics(topicCategory);

	const [selectedCompanies, setSelectedCompanies] = useState<InternalOption[]>(
		[],
	);
	const [selectedTopics, setSelectedTopics] = useState<InternalOption[]>([]);
	const [difficulty, setDifficulty] = useState("");
	const [completionDuration, setCompletionDuration] =
		useState(INITIAL_DURATION);

	useEffect(() => {
		if (!postId) return;
		const data = consolidateData();
		getSidebarData(data);
		setLocalStorage(`sidebar-${postId}`, data);
	}, [selectedCompanies, selectedTopics, difficulty, completionDuration]);

	useEffect(() => {
		if (!postId || dataLoading) return;

		const savedData = getLocalStorage<QuestionSidebarData>(`sidebar-${postId}`);

		if (savedData) {
			initializeState(savedData);
		} else if (defaultContent) {
			initializeState(defaultContent);
		}
	}, [postId, dataLoading]);

	function initializeState(initialData: QuestionSidebarData) {
		if (!initialData) return;

		// Initialize Companies
		setSelectedCompanies(
			companies
				.filter((c) => initialData?.companies?.includes(c.label))
				.map((c) => ({ ...c, checked: true })),
		);

		// Initialize Topics
		if (initialData.topics) {
			setSelectedTopics(
				initialData.topics.map((t) => ({ label: t, checked: true })),
			);
		}

		if (initialData.completionDuration)
			setCompletionDuration(convertFromMinutes(initialData.completionDuration));
		if (initialData.difficulty) setDifficulty(initialData.difficulty);
	}

	function consolidateData(): QuestionSidebarData {
		const data: QuestionSidebarData = {};

		if (selectedCompanies.length > 0) {
			data.companies = selectedCompanies.map((opt) => opt.label);
		}

		if (selectedTopics.length > 0) {
			data.topics = selectedTopics.map((opt) => opt.label);
		}

		if (difficulty) {
			data.difficulty = difficulty.toUpperCase();
		}

		if (completionDuration) {
			data.completionDuration = convertToMinutes(completionDuration);
		}

		return data;
	}

	return (
		<Card>
			<CardContent>
				<Accordion
					defaultValue={["difficulty", "companies"]}
					type="multiple"
					className="w-full"
				>
					<AccordionItem value="difficulty">
						<AccordionTrigger>
							<TooltipAccordianTrigger
								label="Difficulty"
								icon={<MdOutlineGpsFixed size={16} />}
							/>
						</AccordionTrigger>
						<AccordionContent>
							<RadioGroupGrid
								selectedOption={difficulty}
								options={["EASY", "MEDIUM", "HARD"]}
								getSelectedOption={setDifficulty}
								disabled={dataLoading}
							/>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="companies">
						<AccordionTrigger>
							<TooltipAccordianTrigger
								label="Companies"
								icon={<RiBuilding2Line size={16} />}
							/>
						</AccordionTrigger>
						<AccordionContent>
							<CheckboxGrid
								selectedOptions={selectedCompanies}
								options={companies}
								itemOffset={15}
								getSelectedOptons={setSelectedCompanies}
								searchHandler={searchCompanies}
								disabled={dataLoading}
							/>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="topics">
						<AccordionTrigger>
							<TooltipAccordianTrigger
								label="Topics"
								icon={<AiOutlineTag size={16} />}
							/>
						</AccordionTrigger>
						<AccordionContent>
							<CheckboxGrid
								selectedOptions={selectedTopics}
								options={topics}
								itemOffset={21}
								getSelectedOptons={setSelectedTopics}
								searchHandler={searchTopics}
								disabled={dataLoading}
							/>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="duration">
						<AccordionTrigger>
							<TooltipAccordianTrigger
								label="Duration"
								icon={<IoMdTime size={16} />}
							/>
						</AccordionTrigger>
						<AccordionContent>
							<DurationPicker
								duration={completionDuration}
								onChange={setCompletionDuration}
								disabled={dataLoading}
							/>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</CardContent>
		</Card>
	);
}

export default QuestionSidebar;
