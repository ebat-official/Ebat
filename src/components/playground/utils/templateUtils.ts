import { getTemplate } from "../lib/templates";
import { useWebContainerStore } from "../store/webContainer";
import type { Template } from "../lib/types";
import type { FileSystemTree } from "../lib/types";

export const handleTemplateSelect = async (templateId: string) => {
	const template = getTemplate(templateId);
	if (template) {
		const { selectTemplate } = useWebContainerStore.getState();
		await selectTemplate(template);
	}
};

/**
 * Extract only the src folder from current files and merge with original template
 * This ensures we only save user's source code, not node_modules or other build artifacts
 */
export const extractSrcFromTemplate = (
	currentFiles: FileSystemTree,
	originalTemplate: Template,
): FileSystemTree => {
	// Start with the original template files
	const templateFiles = originalTemplate.files as FileSystemTree;

	// Extract only the src folder from current files
	const currentSrc = currentFiles.src;

	// If there's a src folder in current files, replace the template's src with it
	if (currentSrc && "directory" in currentSrc) {
		return {
			...templateFiles,
			src: currentSrc,
		};
	}

	// If no src folder found, return original template files
	return templateFiles;
};
