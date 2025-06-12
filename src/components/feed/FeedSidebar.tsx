"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckboxGrid, InternalOption } from "../shared/ChecboxGrid";
import useCompanies from "@/hooks/useCompanyList";
import useTopics from "@/hooks/useTopicList";
import { RiBuilding2Line } from "react-icons/ri";
import { AiOutlineTag } from "react-icons/ai";
import TooltipAccordianTrigger from "../shared/TooltipAccordianTrigger";
import { TopicCategory } from "@/utils/types";
import { useFeedContext } from "./FeedContext";
import { Difficulty } from "@prisma/client";
import { MdOutlineGpsFixed } from "react-icons/md";

interface FeedSidebarProps {}

const difficultyOptions = Object.values(Difficulty).map((d) => ({
	label: d,
	value: d,
}));

function FeedSidebar({}: FeedSidebarProps) {
	const {
		isLoadingData,
		subCategory = "",
		setCompanies,
		setTopics,
		setDifficulty,
	} = useFeedContext();
	const { companies, searchCompanies } = useCompanies();
	const { topics, searchTopics } = useTopics(
		subCategory.toUpperCase() as TopicCategory,
	);

	const [selectedCompanies, setSelectedCompanies] = useState<InternalOption[]>(
		[],
	);
	const [selectedTopics, setSelectedTopics] = useState<InternalOption[]>([]);
	const [selectedDifficulties, setSelectedDifficulties] = useState<
		InternalOption[]
	>([]);

	useEffect(() => {
		setCompanies(selectedCompanies.map((c) => c.label));
	}, [selectedCompanies]);

	useEffect(() => {
		setTopics(selectedTopics.map((t) => t.label));
	}, [selectedTopics]);

	useEffect(() => {
		setDifficulty(selectedDifficulties.map((d) => d.label));
	}, [selectedDifficulties]);

	return (
		<Card>
			<CardContent>
				<Accordion
					defaultValue={["companies", "difficulty"]}
					type="multiple"
					className="w-full"
				>
					<AccordionItem value="difficulty">
						<AccordionTrigger>
							<TooltipAccordianTrigger
								label="Difficulty"
								icon={<MdOutlineGpsFixed size={16} />}
								tooltipContent="choose difficulty level"
							/>
						</AccordionTrigger>
						<AccordionContent>
							<CheckboxGrid
								selectedOptions={selectedDifficulties}
								options={difficultyOptions}
								itemOffset={3}
								getSelectedOptons={setSelectedDifficulties}
								disabled={isLoadingData}
							/>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="companies">
						<AccordionTrigger>
							<TooltipAccordianTrigger
								label="Companies"
								icon={<RiBuilding2Line size={16} />}
								tooltipContent="choose company wise questions"
							/>
						</AccordionTrigger>
						<AccordionContent>
							<CheckboxGrid
								selectedOptions={selectedCompanies}
								options={companies}
								itemOffset={15}
								getSelectedOptons={setSelectedCompanies}
								searchHandler={searchCompanies}
								disabled={isLoadingData}
							/>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="topics">
						<AccordionTrigger>
							<TooltipAccordianTrigger
								label="Topics"
								icon={<AiOutlineTag size={16} />}
								tooltipContent="choose topic wise questions"
							/>
						</AccordionTrigger>
						<AccordionContent>
							<CheckboxGrid
								selectedOptions={selectedTopics}
								options={topics}
								itemOffset={21}
								getSelectedOptons={setSelectedTopics}
								searchHandler={searchTopics}
								disabled={isLoadingData}
							/>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</CardContent>
		</Card>
	);
}

export default FeedSidebar;
