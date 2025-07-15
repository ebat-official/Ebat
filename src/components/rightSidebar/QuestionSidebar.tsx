"use client";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { PostType } from "@/db/schema/enums";
import useCompanies from "@/hooks/useCompanyList";
import useLocalStorage from "@/hooks/useLocalStorage";
import useTopics from "@/hooks/useTopicList";
import { getLocalStorage, setLocalStorage } from "@/lib/localStorage";
import { convertFromMinutes, convertToMinutes } from "@/utils/converToMinutes";
import { QuestionSidebarData, TopicCategory } from "@/utils/types";
import React, { useEffect, useState } from "react";
import { AiOutlineTag } from "react-icons/ai";
import { CiCircleList } from "react-icons/ci";
import { IoMdTime } from "react-icons/io";
import { MdOutlineGpsFixed } from "react-icons/md";
import { RiBuilding2Line } from "react-icons/ri";
import { TableOfContent } from "../post edit/TableOfContent";
import { CheckboxGrid, InternalOption } from "../shared/ChecboxGrid";
import DurationPicker from "../shared/DurationPicker";
import { RadioGrid as RadioGroupGrid } from "../shared/RadioGrid";
import TooltipAccordianTrigger from "../shared/TooltipAccordianTrigger";
import { Card, CardContent } from "../ui/card";

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
	postType: PostType;
}

const INITIAL_DURATION: Duration = { days: "0", minutes: "5", hours: "0" };

function QuestionSidebar({
	topicCategory,
	getSidebarData,
	postId,
	defaultContent,
	dataLoading,
	postType,
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
		if (!postId || dataLoading) return;
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
					defaultValue={["difficulty", "table of contents"]}
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
					{(postType === PostType.BLOGS ||
						postType === PostType.SYSTEMDESIGN) && (
						<AccordionItem value="table of contents">
							<AccordionTrigger>
								<TooltipAccordianTrigger
									label="Table of Contents"
									icon={<CiCircleList size={20} />}
								/>
							</AccordionTrigger>
							<AccordionContent>
								<TableOfContent />
							</AccordionContent>
						</AccordionItem>
					)}
				</Accordion>
			</CardContent>
		</Card>
	);
}

export default QuestionSidebar;
