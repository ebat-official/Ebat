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
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useWebContainerStore } from "../../store/webContainer";

interface HeaderProps {
	explorerCollapsed: boolean;
	onToggleExplorer: () => void;
}

export function Header({ explorerCollapsed, onToggleExplorer }: HeaderProps) {
	const { selectedTemplate, isLoading, selectTemplate } =
		useWebContainerStore();

	const handleTemplateSelect = async (templateId: string) => {
		const template = templates.find((t) => t.id === templateId);
		if (template) {
			await selectTemplate(template);
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

				<Select
					value={selectedTemplate?.id}
					onValueChange={handleTemplateSelect}
					disabled={isLoading}
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
			</div>
		</header>
	);
}
