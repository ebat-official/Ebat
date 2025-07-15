import type { FileSystemTree } from "@webcontainer/api";
import { debounce } from "lodash-es";
import type { Template } from "../lib/types";

// Storage interface for saved templates
export interface SavedTemplate {
	postId: string;
	templateId: string;
	templateName: string;
	srcFiles: FileSystemTree;
	lastSaved: number;
}

// Generate localStorage key
const generateStorageKey = (postId: string, templateId: string): string => {
	return `PostView_${postId}_${templateId}`;
};

// Extract src folder from template (using existing logic)
const extractSrcFromTemplate = (
	files: FileSystemTree,
	template: Template,
): FileSystemTree => {
	// If template has src folder, extract it
	if (files.src && "directory" in files.src) {
		return files.src.directory;
	}

	// Otherwise return all files
	return files;
};

// Async localStorage operations (non-blocking)
const asyncSetItem = (key: string, value: string): void => {
	// Fire and forget - don't block the thread
	const saveOperation = () => {
		try {
			localStorage.setItem(key, value);
		} catch (error) {
			console.warn("Failed to save template to localStorage:", error);
		}
	};

	// Use requestIdleCallback if available, otherwise setTimeout
	if (typeof window !== "undefined") {
		if ("requestIdleCallback" in window) {
			window.requestIdleCallback(saveOperation);
		} else {
			setTimeout(saveOperation, 0);
		}
	}
};

const asyncRemoveItem = (key: string): void => {
	// Fire and forget - don't block the thread
	const removeOperation = () => {
		try {
			localStorage.removeItem(key);
		} catch (error) {
			console.warn("Failed to remove from localStorage:", error);
		}
	};

	if (typeof window !== "undefined") {
		if ("requestIdleCallback" in window) {
			window.requestIdleCallback(removeOperation);
		} else {
			setTimeout(removeOperation, 0);
		}
	}
};

// Main template storage utility
const DEBOUNCE_DELAY = 3000; // 3 seconds
const debouncedSaveMap = new Map<string, () => void>();

export namespace TemplateStorage {
	/**
	 * Save template to localStorage (debounced, non-blocking)
	 */
	export function saveTemplate(
		postId: string,
		templateId: string,
		templateName: string,
		currentFiles: FileSystemTree,
		selectedTemplate: Template,
	): void {
		const key = generateStorageKey(postId, templateId);

		// Create or get debounced save function for this key
		if (!debouncedSaveMap.has(key)) {
			const saveOperation = () => {
				try {
					const cleanTemplate = extractSrcFromTemplate(
						currentFiles,
						selectedTemplate,
					);

					const savedTemplate: SavedTemplate = {
						postId,
						templateId,
						templateName,
						srcFiles: cleanTemplate,
						lastSaved: Date.now(),
					};

					// Async save (non-blocking)
					asyncSetItem(key, JSON.stringify(savedTemplate));
				} catch (error) {
					console.warn("Failed to prepare template for saving:", error);
				}
			};

			debouncedSaveMap.set(key, debounce(saveOperation, DEBOUNCE_DELAY));
		}

		// Trigger debounced save
		const debouncedSave = debouncedSaveMap.get(key);
		if (debouncedSave) {
			debouncedSave();
		}
	}

	/**
	 * Load template from localStorage (returns raw saved template data)
	 */
	export function loadTemplate(
		postId: string,
		templateId: string,
	): SavedTemplate | null {
		const key = generateStorageKey(postId, templateId);

		try {
			if (typeof window === "undefined") return null;

			const data = localStorage.getItem(key);
			if (!data) return null;

			const savedTemplate: SavedTemplate = JSON.parse(data);
			return savedTemplate;
		} catch (error) {
			console.warn("Failed to load template from localStorage:", error);
			return null;
		}
	}

	/**
	 * Clear template from localStorage
	 */
	export function clearTemplate(postId: string, templateId: string): void {
		const key = generateStorageKey(postId, templateId);
		asyncRemoveItem(key);

		// Clean up debounced save function
		debouncedSaveMap.delete(key);
	}
}
