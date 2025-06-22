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
import type { FileSystemTree } from "../playground/lib/types";

const frameworks = Object.values(TemplateFramework);

interface TemplateCreatorProps {
	onTemplatesSave?: (templates: {
		framework: TemplateFramework;
		questionTemplate: FileSystemTree;
		answerTemplate: FileSystemTree;
	}) => void;
}

function TemplateCreatorComponent({ onTemplatesSave }: TemplateCreatorProps) {
	const [value, setValue] = React.useState("");
	const [showModal, setShowModal] = React.useState(false);

	// Generate a unique ID for this instance
	const instanceId = React.useRef(Math.random().toString(36).substr(2, 9));

	const handleFrameworkSelect = async (selectedValue: string) => {
		setValue(selectedValue);
		if (selectedValue && selectedValue !== value) {
			await handleTemplateSelect(selectedValue.toUpperCase());
			setShowModal(true);
		}
	};

	const handleTemplatesSave = (templates: {
		framework: TemplateFramework;
		questionTemplate: FileSystemTree;
		answerTemplate: FileSystemTree;
	}) => {
		onTemplatesSave?.(templates);
		setShowModal(false);
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
								onSave={handleTemplatesSave}
							/>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

// Memoize the component to prevent unnecessary re-renders
export const TemplateCreator = React.memo(TemplateCreatorComponent);
