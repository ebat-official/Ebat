"use client";
import React from "react";
import { Card, CardContent } from "../ui/card";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import CheckboxGrid from "./ChecboxGrid";
import RadioGroupGrid from "./RadioGrid";
import { CommandInput } from "../ui/command";

const javascriptQuestionTopics = [
	"ControlFlow",
	"ES6",
	"Async",
	"DOM",
	"ErrorHandling",
	"Objects",
	"Closures",
	"OOP",
	"Functional",
	"Libraries",
	"Testing",
	"Performance",
	"WebAPIs",
	"Events",
	"Modules",
	"Promises",
	"StateManagement",
	"Regex",
	"Destructuring",
	"SpreadOperator",
	"TypeCoercion",
	"Memory",
	"EventLoop",
	"Polyfills",
	"AsyncAwait",
	"PromiseChain",
].sort();

function QuestionSidebar() {
	return (
		<Card className="h-screen">
			<CardContent>
				<Accordion
					defaultValue={["diffuculty", "topics"]}
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
					<AccordionItem value="topics">
						<AccordionTrigger>Topics</AccordionTrigger>
						<AccordionContent>
							<CheckboxGrid
								options={javascriptQuestionTopics}
								itemOffset={15}
								onChange={(it) => {
									console.log(it);
								}}
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
