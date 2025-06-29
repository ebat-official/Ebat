import { useWebContainerStore } from "../store/webContainer";
import { extractSrcFromTemplate } from "./templateUtils";
import type { Template } from "../lib/types";
import type { TemplateFramework } from "@prisma/client";

/**
 * Extract the current solution template from WebContainer
 * This function can be used for both submissions and template creation
 */
export const extractSolutionTemplate = async (): Promise<{
	template: Template | null;
	framework: TemplateFramework | null;
}> => {
	const { getFileTree, selectedTemplate } = useWebContainerStore.getState();

	if (!selectedTemplate) {
		return {
			template: null,
			framework: null,
		};
	}

	try {
		// Get current files from WebContainer
		const currentFiles = await getFileTree(".");

		if (!currentFiles || Object.keys(currentFiles).length === 0) {
			throw new Error("No files found in WebContainer");
		}

		// Extract only src files and merge with original template
		const cleanTemplate = extractSrcFromTemplate(
			currentFiles,
			selectedTemplate,
		);

		// Convert template ID to framework enum (with safety uppercase)
		const framework = selectedTemplate.id.toUpperCase() as TemplateFramework;

		return {
			template: cleanTemplate,
			framework,
		};
	} catch (error) {
		console.error("Failed to extract solution template:", error);
		return {
			template: null,
			framework: null,
		};
	}
};

/**
 * Get challenge submission context
 */
export const getChallengeContext = () => {
	const { post, selectedTemplate } = useWebContainerStore.getState();

	if (!post) {
		return null;
	}

	const framework = selectedTemplate
		? (selectedTemplate.id.toUpperCase() as TemplateFramework)
		: null;

	return {
		postId: post.id,
		framework,
		isChallenge: true,
	};
};
