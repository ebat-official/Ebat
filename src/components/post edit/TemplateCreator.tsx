"use client";

import * as React from "react";
import { TemplateFramework } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import TemplateCreationInterface from "./TemplateCreationInterface";
import { handleTemplateSelect } from "../playground/utils/templateUtils";

const frameworks = Object.values(TemplateFramework);

export function TemplateCreator() {
	const [value, setValue] = React.useState("");
	const [showModal, setShowModal] = React.useState(false);

	const handleFrameworkSelect = async (selectedValue: string) => {
		setValue(selectedValue);
		if (selectedValue && selectedValue !== value) {
			await handleTemplateSelect(selectedValue.toUpperCase());
			setShowModal(true);
		}
	};

	const formatFrameworkName = (framework: string) => {
		return framework.toLowerCase().replace(/(^|\s)\S/g, (L) => L.toUpperCase());
	};

	return (
		<>
			<Select value={value} onValueChange={handleFrameworkSelect}>
				<SelectTrigger className="max-w-[400px] w-full mx-auto p-6">
					<SelectValue placeholder="Select framework..." />
				</SelectTrigger>
				<SelectContent>
					{frameworks.map((framework) => (
						<SelectItem key={framework} value={framework}>
							{formatFrameworkName(framework)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Dialog open={showModal} onOpenChange={setShowModal}>
				<DialogContent className="w-[100vw] h-[100vh] !max-w-none !max-h-none">
					<DialogHeader>
						<DialogTitle>
							Create {value ? formatFrameworkName(value) : ""} Template
						</DialogTitle>
					</DialogHeader>
					<div className="flex-1 h-[calc(100vh-120px)]">
						{value && (
							<TemplateCreationInterface
								selectedFramework={value as TemplateFramework}
							/>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
