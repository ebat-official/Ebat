import { angularTemplate } from "./templates/angular";
import { javascriptTemplate } from "./templates/javascript";
import { nextjsTemplate } from "./templates/nextJs";
import { reactViteTemplate } from "./templates/reactJs";
import { sveltekitTemplate } from "./templates/sveltekit";
import { vanillaJsTemplate } from "./templates/vanillaJs";
import { vueTemplate } from "./templates/vue";
import type { Template } from "./types";

// Template registry - this will be replaced with API calls later
export const templateRegistry: Record<string, Template> = {
	react: reactViteTemplate,
	nextjs: nextjsTemplate,
	vanillajs: vanillaJsTemplate,
	vue: vueTemplate,
	angular: angularTemplate,
	sveltekit: sveltekitTemplate,
	javascript: javascriptTemplate,
};

// Export templates as an array for backward compatibility
export const templates: Template[] = Object.values(templateRegistry);

// Helper function to get a template by ID
export const getTemplate = (id: string): Template | undefined => {
	return templateRegistry[id];
};

// Helper function to get template metadata (useful for API)
export const getTemplateMetadata = (id: string) => {
	const template = templateRegistry[id];
	if (!template) return null;

	return {
		id: template.id,
		name: template.name,
		description: template.description,
		icon: template.icon,
	};
};

// Export types for API usage
export type TemplateMetadata = {
	id: string;
	name: string;
	description: string;
	icon: string;
};
