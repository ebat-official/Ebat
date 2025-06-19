import type { Template } from "./types";
import { reactViteTemplate } from "./templates/reactJs";
import { nextjsTemplate } from "./templates/nextJs";
import { vanillaJsTemplate } from "./templates/vanillaJs";
import { vueTemplate } from "./templates/vue";
import { angularTemplate } from "./templates/angular";
import { sveltekitTemplate } from "./templates/sveltekit";
import { javascriptTemplate } from "./templates/javascript";

// Template registry - this will be replaced with API calls later
export const templateRegistry: Record<string, Template> = {
	"react-vite": reactViteTemplate,
	nextjs: nextjsTemplate,
	"vanilla-js": vanillaJsTemplate,
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
