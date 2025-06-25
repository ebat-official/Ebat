"use client";

import * as React from "react";
import { TemplateFramework } from "@prisma/client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import TemplateCreationInterface from "./TemplateCreationInterface";
import { handleTemplateSelect } from "../../playground/utils/templateUtils";
import type { FileSystemTree } from "../../playground/lib/types";

const frameworks = Object.values(TemplateFramework);

interface TemplateCreatorProps {
	onTemplatesSave?: (templates: {
		framework: TemplateFramework;
		questionTemplate: FileSystemTree;
		answerTemplate: FileSystemTree;
	}) => void;
	editingTemplate?: {
		framework: TemplateFramework;
		questionTemplate: FileSystemTree;
		answerTemplate: FileSystemTree;
	} | null;
	onCancelEdit?: () => void;
	dataLoading?: boolean;
	challengeTemplates?: {
		framework: TemplateFramework;
		questionTemplate: FileSystemTree;
		answerTemplate: FileSystemTree;
	}[];
}

function TemplateCreatorComponent({
	onTemplatesSave,
	editingTemplate,
	onCancelEdit,
	dataLoading = false,
	challengeTemplates = [],
}: TemplateCreatorProps) {
	const [value, setValue] = React.useState("");
	const [showModal, setShowModal] = React.useState(false);

	// Generate a unique ID for this instance
	const instanceId = React.useRef(Math.random().toString(36).substr(2, 9));

	// Filter out already created frameworks
	const availableFrameworks = React.useMemo(() => {
		const createdFrameworks = new Set(
			challengeTemplates.map((t) => t.framework),
		);
		return frameworks.filter((framework) => !createdFrameworks.has(framework));
	}, [challengeTemplates]);

	// Set initial value when editing
	React.useEffect(() => {
		if (editingTemplate) {
			setValue(editingTemplate.framework);
			setShowModal(true);
		}
	}, [editingTemplate]);

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
		setValue(""); // Reset selection
	};

	const handleModalClose = () => {
		setShowModal(false);
		setValue(""); // Reset selection
		if (editingTemplate && onCancelEdit) {
			onCancelEdit();
		}
	};

	return (
		<>
			{!editingTemplate && availableFrameworks.length > 0 && (
				<Select
					value={value}
					onValueChange={handleFrameworkSelect}
					disabled={dataLoading}
				>
					<SelectTrigger className="max-w-[400px] w-full mx-auto p-6">
						<SelectValue
							placeholder={dataLoading ? "Loading..." : "Select framework..."}
						/>
					</SelectTrigger>
					<SelectContent>
						{availableFrameworks.map((framework) => (
							<SelectItem
								key={framework}
								value={framework}
								className="capitalize"
							>
								{framework?.toLowerCase()}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}

			{!editingTemplate &&
				availableFrameworks.length === 0 &&
				challengeTemplates.length > 0 && (
					<div className="text-center py-4 text-gray-500 dark:text-gray-400">
						<p>All frameworks have been configured for this challenge.</p>
					</div>
				)}

			<Dialog open={showModal} onOpenChange={handleModalClose}>
				<DialogContent className="w-[100vw] h-[100vh] !max-w-none !max-h-none p-0 pt-10 border-none">
					{value && (
						<TemplateCreationInterface
							selectedFramework={value as TemplateFramework}
							onSave={handleTemplatesSave}
							editingTemplate={editingTemplate}
						/>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}

// Memoize the component to prevent unnecessary re-renders
export const TemplateCreator = React.memo(TemplateCreatorComponent);
