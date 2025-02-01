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
import { CommandInput } from "../ui/command";
import useCompanies from "@/hooks/useCompanyList";
import useTopics from "@/hooks/useTopicList";
import DurationPicker from "../shared/DurationPicker";
import { MdOutlineGpsFixed } from "react-icons/md";
import { RiBuilding2Line } from "react-icons/ri";
import { AiOutlineTag } from "react-icons/ai";
import { IoMdTime } from "react-icons/io";

function QuestionSidebar() {
	const { companies, searchCompanies } = useCompanies();
	const { topics, searchTopics } = useTopics("javascript");
	const [selectedCompanies, setSelectedCompanies] = useState<InternalOption[]>(
		[],
	);
	const [selectedTopics, setSelectedTopics] = useState<InternalOption[]>([]);
	function getSelectedCompaniesLabel() {
		return selectedCompanies.map((company) => company.label);
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
							<div className="flex items-center justify-center gap-1">
								<span>Diffuculty </span>
								<MdOutlineGpsFixed size={16} />
							</div>
						</AccordionTrigger>
						<AccordionContent>
							<RadioGroupGrid
								options={["Easy", "Medium", "Hard"]}
								onChange={(it) => {
									console.log(it);
								}}
							/>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="companies">
						<AccordionTrigger>
							<div className="flex items-center justify-center gap-1">
								<span>Companies</span>
								<RiBuilding2Line size={16} />
							</div>
						</AccordionTrigger>
						<AccordionContent>
							<CheckboxGrid
								options={[...selectedCompanies, ...companies]}
								itemOffset={15}
								getSelectedOptons={setSelectedCompanies}
								searchHandler={searchCompanies}
							/>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="topics">
						<AccordionTrigger>
							<div className="flex items-center justify-center gap-1">
								<span>Topics</span>
								<AiOutlineTag size={16} />
							</div>
						</AccordionTrigger>
						<AccordionContent>
							<CheckboxGrid
								options={topics}
								itemOffset={21}
								getSelectedOptons={setSelectedTopics}
								searchHandler={searchTopics}
							/>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item-3">
						<AccordionTrigger>
							<div className="flex items-center justify-center gap-1">
								<span>Duration</span>
								<IoMdTime size={16} />
							</div>
						</AccordionTrigger>
						<AccordionContent>
							<DurationPicker />
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</CardContent>
		</Card>
	);
}

export default QuestionSidebar;
