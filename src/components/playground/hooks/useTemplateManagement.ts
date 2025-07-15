import { TemplateFramework } from "@/db/schema/enums";
import { useCallback, useEffect, useState } from "react";
import type { Template } from "../lib/types";
import { useWebContainerStore } from "../store/webContainer";
import { handleTemplateSelect } from "../utils/templateUtils";

interface EditingTemplate {
	framework: TemplateFramework;
	questionTemplate: Template;
	answerTemplate: Template;
}

export const useTemplateManagement = (
	editingTemplate: EditingTemplate | null | undefined,
	selectedFramework: TemplateFramework,
) => {
	const { selectedTemplate, isContainerReady, selectTemplate } =
		useWebContainerStore();
	const [answerTemplate, setAnswerTemplate] = useState<Template | null>(
		editingTemplate?.answerTemplate || null,
	);
	const [questionTemplate, setQuestionTemplate] = useState<Template | null>(
		editingTemplate?.questionTemplate || null,
	);

	// Initialize templates
	useEffect(() => {
		if (isContainerReady && selectedFramework) {
			if (editingTemplate) {
				// Ensure both templates have the same defaultFile
				const defaultFile =
					editingTemplate.questionTemplate.defaultFile ||
					editingTemplate.answerTemplate.defaultFile;

				const answerTemplateWithDefaultFile = {
					...editingTemplate.answerTemplate,
					defaultFile,
				};

				const questionTemplateWithDefaultFile = {
					...editingTemplate.questionTemplate,
					defaultFile,
				};

				setAnswerTemplate(answerTemplateWithDefaultFile);
				setQuestionTemplate(questionTemplateWithDefaultFile);
				selectTemplate(answerTemplateWithDefaultFile);
			} else {
				// Load the default template
				handleTemplateSelect(selectedFramework);
			}
		}
	}, [selectedFramework, isContainerReady, editingTemplate, selectTemplate]);

	// Update defaultFile for both templates
	const updateDefaultFile = useCallback((defaultFile: string) => {
		setQuestionTemplate((prev) => (prev ? { ...prev, defaultFile } : null));
		setAnswerTemplate((prev) => (prev ? { ...prev, defaultFile } : null));
	}, []);

	// Create template with defaultFile
	const createTemplateWithDefaultFile = useCallback(
		(baseTemplate: Template, defaultFile?: string) => ({
			...baseTemplate,
			defaultFile: defaultFile || baseTemplate.defaultFile,
		}),
		[],
	);

	return {
		selectedTemplate,
		answerTemplate,
		questionTemplate,
		setAnswerTemplate,
		setQuestionTemplate,
		updateDefaultFile,
		createTemplateWithDefaultFile,
	};
};
