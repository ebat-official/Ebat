import { getTemplate } from "../lib/templates";
import { useWebContainerStore } from "../store/webContainer";

export const handleTemplateSelect = async (templateId: string) => {
	const template = getTemplate(templateId);
	if (template) {
		const { selectTemplate } = useWebContainerStore.getState();
		await selectTemplate(template);
	}
};
