"use client";

import React from "react";
import { ChevronDown, Code2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Template } from "@/lib/types";

interface TemplateSelectorProps {
	templates: Template[];
	selectedTemplate: Template | null;
	onTemplateSelect: (template: Template) => void;
	isLoading: boolean;
}

const templateIcons = {
	"react-vite": "⚛️",
	nextjs: "▲",
	"vanilla-js": "🟨",
	vue: "💚",
} as const;

export function TemplateSelector({
	templates,
	selectedTemplate,
	onTemplateSelect,
	isLoading,
}: TemplateSelectorProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					disabled={isLoading}
					className="min-w-[200px]"
				>
					{isLoading ? (
						<Loader2 className="w-4 h-4 mr-2 animate-spin" />
					) : (
						<Code2 className="w-4 h-4 mr-2" />
					)}
					<span className="flex-1 text-left">
						{selectedTemplate ? selectedTemplate.name : "Choose Template"}
					</span>
					<ChevronDown className="w-4 h-4 ml-2" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-80" align="end">
				<DropdownMenuLabel>Select a Template</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{templates.map((template) => {
					const icon =
						templateIcons[template.id as keyof typeof templateIcons] || "📄";
					const isSelected = selectedTemplate?.id === template.id;

					return (
						<DropdownMenuItem
							key={template.id}
							onClick={() => onTemplateSelect(template)}
							disabled={isLoading}
							className="flex items-center gap-3 p-3 cursor-pointer"
						>
							<div className="text-2xl flex-shrink-0">{icon}</div>
							<div className="flex-1 min-w-0">
								<div className="font-medium text-sm">{template.name}</div>
								<div className="text-xs text-muted-foreground mt-1">
									{template.description}
								</div>
							</div>
							{isSelected && (
								<div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
							)}
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
