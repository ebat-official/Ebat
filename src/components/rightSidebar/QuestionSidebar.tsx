import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import CheckboxGrid, { InternalOption } from "./ChecboxGrid";
import RadioGroupGrid from "./RadioGrid";
import { CommandInput } from "../ui/command";
import useCompanies from "@/hooks/useCompanyList";
import useTopics from "@/hooks/useTopicList";
import DurationPicker from "../shared/DurationPicker";
import { MdOutlineGpsFixed } from "react-icons/md";
import { RiBuilding2Line } from "react-icons/ri";
import { AiOutlineTag } from "react-icons/ai";
import { IoMdTime } from "react-icons/io";
import { SubCategory } from "@/utils/subCategoryConfig";
import { convertToMinutes } from "@/utils/converToMinutes";

type ConsolidatedData = {
	companies: string[];
	topics: string[];
	difficulty: string;
	duration: number;
};

interface QuestionSidebarProps {
	subcategory: SubCategory;
	getSidebarData: (args: ConsolidatedData) => void;
}

function QuestionSidebar({
	subcategory,
	getSidebarData,
}: QuestionSidebarProps) {
	const { companies, searchCompanies } = useCompanies();
	const { topics, searchTopics } = useTopics(subcategory);
	const [selectedCompanies, setSelectedCompanies] = useState<InternalOption[]>(
		[],
	);
	const [selectedTopics, setSelectedTopics] = useState<InternalOption[]>([]);
	const [difficulty, setDifficulty] = useState("");
	const [duration, setDuration] = useState({
		days: "0",
		minutes: "5",
		hours: "0",
	});

	useEffect(() => {
		getSidebarData(consolidateData());
	}, [selectedCompanies, selectedTopics, difficulty, duration]);

	function getSelectedLabels(options: InternalOption[] | []) {
		return options.map((optn) => optn.label);
	}

	function consolidateData(): ConsolidatedData {
		return {
			companies: getSelectedLabels(selectedCompanies),
			topics: getSelectedLabels(selectedTopics),
			difficulty: difficulty.toUpperCase(),
			duration: convertToMinutes(duration),
		};
	}

	return (
		<Card>
			<CardContent>
				<Accordion
					defaultValue={["diffuculty", "companies"]}
					type="multiple"
					className="w-full"
				>
					<AccordionItem value="diffuculty">
						<AccordionTrigger>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="flex items-center justify-center gap-1">
											<span>Diffuculty</span>
											<MdOutlineGpsFixed size={16} />
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<p>Choose the question difficulty</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</AccordionTrigger>
						<AccordionContent>
							<RadioGroupGrid
								selectedOption={difficulty}
								options={["Easy", "Medium", "Hard"]}
								getSelectedOption={setDifficulty}
							/>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="companies">
						<AccordionTrigger>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="flex items-center justify-center gap-1">
											<span>Companies</span>
											<RiBuilding2Line size={16} />
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<p>Companies asked this question</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
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
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="flex items-center justify-center gap-1">
											<span>Topics</span>
											<AiOutlineTag size={16} />
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<p>Related topics for this question</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
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
					<AccordionItem value="item-3">
						<AccordionTrigger>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="flex items-center justify-center gap-1">
											<span>Duration</span>
											<IoMdTime size={16} />
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<p>Question completion duration</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
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
