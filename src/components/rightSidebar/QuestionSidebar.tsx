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
import { SubCategory } from "@prisma/client";
import { convertFromMinutes, convertToMinutes } from "@/utils/converToMinutes";
import useLocalStorage from "@/hooks/useLocalStorage";
import TooltipAccordianTrigger from "../shared/TooltipAccordianTrigger";

type ConsolidatedData = {
	companies: string[];
	topics: string[];
	difficulty: string;
	duration: number;
};

export type Duration = {
	days: string;
	hours: string;
	minutes: string;
};

interface QuestionSidebarProps {
	subCategory: SubCategory;
	getSidebarData: (args: ConsolidatedData) => void;
	postId: string;
	defaultContent?: ConsolidatedData | undefined;
}

const INITIAL_DURATION: Duration = { days: "0", minutes: "5", hours: "0" };

function QuestionSidebar({
	subCategory,
	getSidebarData,
	postId,
	defaultContent,
}: QuestionSidebarProps) {
	const { companies, searchCompanies } = useCompanies();
	const { topics, searchTopics } = useTopics(subCategory);

	const [selectedCompanies, setSelectedCompanies] = useState<InternalOption[]>(
		[],
	);
	const [selectedTopics, setSelectedTopics] = useState<InternalOption[]>([]);
	const [difficulty, setDifficulty] = useState("");
	const [duration, setDuration] = useState(INITIAL_DURATION);

	const [localstorageContent, setLocalstorageContent] =
		useLocalStorage<ConsolidatedData | null>(
			postId ? `sidebar-${postId}` : null,
			null,
		);

	useEffect(() => {
		const data = consolidateData();
		getSidebarData(data);
		setLocalstorageContent(data);
	}, [selectedCompanies, selectedTopics, difficulty, duration]);

	useEffect(() => {
		if (defaultContent) initializeState(defaultContent);
	}, [defaultContent]);

	useEffect(() => {
		if (localstorageContent) initializeState(localstorageContent);
	}, [postId]);

	function initializeState(initialData: ConsolidatedData) {
		if (!initialData) return;

		// Initialize Companies
		setSelectedCompanies(
			companies
				.filter((c) => initialData.companies.includes(c.label))
				.map((c) => ({ ...c, checked: true })),
		);

		// Initialize Topics
		setSelectedTopics(
			initialData.topics.map((t) => ({ label: t, checked: true })),
		);

		if (initialData.duration)
			setDuration(convertFromMinutes(initialData.duration));
		if (initialData.difficulty) setDifficulty(initialData.difficulty);
	}

	function consolidateData(): ConsolidatedData {
		return {
			companies: selectedCompanies.map((opt) => opt.label),
			topics: selectedTopics.map((opt) => opt.label),
			difficulty: difficulty.toUpperCase(),
			duration: convertToMinutes(duration),
		};
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
							<DurationPicker duration={duration} onChange={setDuration} />
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</CardContent>
		</Card>
	);
}

export default QuestionSidebar;
