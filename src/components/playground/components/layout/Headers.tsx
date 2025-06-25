"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { templates } from "../../lib/templates";
import { PanelLeftClose, PanelLeftOpen, RotateCcw } from "lucide-react";
import { useWebContainerStore } from "../../store/webContainer";
import { handleTemplateSelect } from "../../utils/templateUtils";

interface HeaderProps {
	explorerCollapsed: boolean;
	onToggleExplorer: () => void;
}

export function Header({ explorerCollapsed, onToggleExplorer }: HeaderProps) {
	const {
		selectedTemplate,
		isLoading,
		resetToOriginalTemplate,
		isLanguageDropdownDisabled,
	} = useWebContainerStore();

	const handleResetToOriginal = async () => {
		if (selectedTemplate) {
			await resetToOriginalTemplate();
		}
	};

	return (
		<header className="h-14 border-b border-border flex items-center justify-between px-4">
			<div className="flex items-center gap-2 justify-between w-full">
				<Button
					variant="ghost"
					size="icon"
					onClick={onToggleExplorer}
					className="h-8 w-8"
				>
					{explorerCollapsed ? (
						<PanelLeftClose className="h-4 w-4" />
					) : (
						<PanelLeftOpen className="h-4 w-4" />
					)}
				</Button>

				<div className="flex items-center gap-2">
					<Select
						value={selectedTemplate?.id}
						onValueChange={handleTemplateSelect}
						disabled={isLoading || isLanguageDropdownDisabled}
					>
						<SelectTrigger className="w-[200px]">
							<SelectValue placeholder="Select a template" />
						</SelectTrigger>
						<SelectContent>
							{templates.map((template) => (
								<SelectItem key={template.id} value={template.id}>
									{template.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{selectedTemplate && (
						<Button
							variant="outline"
							size="sm"
							onClick={handleResetToOriginal}
							disabled={isLoading}
							title="Reset to original template files"
							className="h-8 px-2"
						>
							<RotateCcw className="h-4 w-4" />
						</Button>
					)}
				</div>
			</div>
		</header>
	);
}
