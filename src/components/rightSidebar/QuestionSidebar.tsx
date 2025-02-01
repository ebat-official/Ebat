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
		<Card className="h-screen">
			<CardContent>
				<Accordion
					defaultValue={["diffuculty", "companies"]}
					type="multiple"
					className="w-full"
				>
					<AccordionItem value="diffuculty">
						<AccordionTrigger>Diffuculty *</AccordionTrigger>
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
						<AccordionTrigger>Companies</AccordionTrigger>
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
						<AccordionTrigger>Topics</AccordionTrigger>
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
						<AccordionTrigger>Is it animated?</AccordionTrigger>
						<AccordionContent>
							Yes. It's animated by default, but you can disable it if you
							prefer.
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</CardContent>
		</Card>
	);
}

export default QuestionSidebar;
