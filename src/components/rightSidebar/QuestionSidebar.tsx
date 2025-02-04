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
import { SubCategory } from "@prisma/client";
import { convertFromMinutes, convertToMinutes } from "@/utils/converToMinutes";
import useLocalStorage from "@/hooks/useLocalStorage";

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
type LocalStorageContent = {
	selectedCompanies?: InternalOption[];
	selectedTopics?: InternalOption[];
	difficulty?: string;
	duration?: Duration;
};

interface QuestionSidebarProps {
	subCategory: SubCategory;
	getSidebarData: (args: ConsolidatedData) => void;
	postId: string;
	defaultContent?: ConsolidatedData | undefined;
}

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
	const [duration, setDuration] = useState({
		days: "0",
		minutes: "5",
		hours: "0",
	});
	const [localstorageContent, setLocalstorageContent] =
		useLocalStorage<ConsolidatedData | null>(
			postId ? `sidebar-${postId}` : null,
			null,
		);

	console.log(postId, "localstorage", localstorageContent);
	useEffect(() => {
		getSidebarData(consolidateData());
		setLocalstorageContent(consolidateData());
	}, [selectedCompanies, selectedTopics, difficulty, duration]);

	useEffect(() => {
		if (!defaultContent) return;
		initializeState(defaultContent);
	}, [defaultContent]);

	useEffect(() => {
		console.log(postId, "localstorage initi", localstorageContent);
		if (!localstorageContent) return;
		initializeState(localstorageContent);
	}, [postId]);

	function initializeState(initialData: ConsolidatedData) {
		if (!initialData) return;

		if (initialData.companies) {
			const selected = companies
				.filter((company) => initialData.companies.includes(company.label))
				.map((company) => {
					return { ...company, checked: true };
				});
			setSelectedCompanies(selected);
		}

		if (initialData.topics) {
			const selected = initialData.topics.map((topic) => ({
				label: topic,
				checked: true,
			}));
			setSelectedTopics(selected);
		}

		if (initialData.duration) {
			const duration = convertFromMinutes(initialData.duration);
			setDuration(duration);
		}

		if (initialData.difficulty) {
			setDifficulty(initialData.difficulty);
		}
	}

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
										<p>Question difficulty</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
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
