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
import { PanelLeftClose, PanelLeftOpen, RotateCcw } from "lucide-react";
import { useWebContainerStore } from "../../store/webContainer";
import { ChallengeTemplate } from "@/utils/types";

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
		post,
		selectTemplate,
	} = useWebContainerStore();

	const handleResetToOriginal = async () => {
		if (selectedTemplate) {
			await resetToOriginalTemplate();
		}
	};

	const handleTemplateChange = async (framework: string) => {
		if (!post?.challengeTemplates) return;

		const challengeTemplate = post.challengeTemplates.find(
			(template: ChallengeTemplate) => template.framework === framework,
		);

		if (challengeTemplate?.questionTemplate) {
			await selectTemplate(challengeTemplate.questionTemplate);
		}
	};

	// Get available templates from post data
	const availableTemplates = post?.challengeTemplates || [];

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
						onValueChange={handleTemplateChange}
						disabled={
							isLoading ||
							isLanguageDropdownDisabled ||
							availableTemplates.length === 0
						}
					>
						<SelectTrigger className="w-[200px]">
							<SelectValue placeholder="Select a template" />
						</SelectTrigger>
						<SelectContent>
							{availableTemplates.map(
								(challengeTemplate: ChallengeTemplate) => (
									<SelectItem
										key={challengeTemplate.framework}
										value={challengeTemplate.framework}
									>
										{challengeTemplate.questionTemplate?.name ||
											challengeTemplate.framework}
									</SelectItem>
								),
							)}
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
