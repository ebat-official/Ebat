import type { FileSystemTree as WebContainerFileSystemTree } from "@webcontainer/api";

export type FileSystemTree = WebContainerFileSystemTree;

export interface FileSystemNode {
	file?: {
		contents: string;
	};
	directory?: {
		[path: string]: FileSystemNode;
	};
}

export interface Template {
	id: string;
	name: string;
	description: string;
	icon: string;
	version: number;
	hasPreview: boolean;
	defaultFile: string;
	files: FileSystemTree;
	installCommand?: string;
	startCommand?: string;
}

export interface JestConfig {
	packageJson: {
		dependencies: Record<string, string>;
		scripts: Record<string, string>;
	};
	configFiles: {
		"jest.config.js": string;
		"jest.setup.js": string;
		"babel.config.js": string;
	};
}

export interface TemplateMetadata {
	id: string;
	name: string;
	description: string;
	icon: string;
}
